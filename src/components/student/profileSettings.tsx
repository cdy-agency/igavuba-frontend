"use client";

import React, { useState, useEffect } from "react";
import { Camera, User, Mail, Phone, FileText, Calendar } from "lucide-react";
import { getMyStudentProfile, updateMyStudentProfile } from "@/lib/api/student";
import { toast } from 'react-toastify';

function formatStudentData(student: any) {
  return {
    name: student.user_id?.name || "",
    email: student.user_id?.email || "",
    phone: student.user_id?.phone || "",
    bio: student.bio || "",
    gender: student.gender || "",
    dateOfBirth: student.dateOfBirth
      ? new Date(student.dateOfBirth).toISOString().split("T")[0]
      : "",
    paymentStatus: student.paymentStatus || "pending",
    joinedDate: student.joinedDate || "",
    isActive: student.is_active,
    createdAt: student.createdAt,
    updatedAt: student.updatedAt,
    profileImage: student.profile_image,
  };
}

const ProfileSettings: React.FC = () => {
  const [studentData, setStudentData] = useState<any>(null);
  const [originalData, setOriginalData] = useState<any>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await getMyStudentProfile();
        const formatted = formatStudentData(res.student);
        setStudentData(formatted);
        setOriginalData(formatted);
        if (formatted.profileImage) setProfileImage(formatted.profileImage);
      } catch (err) {
        console.error("Failed to load student profile", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Detect changes
  useEffect(() => {
    if (originalData && studentData) {
      const changed =
        JSON.stringify(originalData) !== JSON.stringify(studentData) ||
        profileImageFile !== null;
      setHasChanges(changed);
    }
  }, [studentData, originalData, profileImageFile]);

  const handleChange = (field: string, value: any) => {
    setStudentData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImageFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) setProfileImage(ev.target.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      const form = new FormData();
      form.append("bio", studentData.bio || "");
      if (studentData.gender) form.append("gender", studentData.gender);
      if (studentData.dateOfBirth) form.append("dateOfBirth", studentData.dateOfBirth);
      if (studentData.name) form.append("name", studentData.name);
      if (studentData.phone) form.append("phone", studentData.phone);
      if (profileImageFile) form.append("profile_image", profileImageFile);

      const res = await updateMyStudentProfile(form);
      const formatted = formatStudentData(res.student);
      setStudentData(formatted);
      setOriginalData(formatted);
      setProfileImageFile(null);

      toast.success('Profile updated successfully!');
    } catch (e) {
      console.error(e);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStudentData(originalData);
    setProfileImageFile(null);
    setProfileImage(originalData?.profileImage || null);
  };

  if (loading && !studentData) {
    return (
      <div className="flex items-center justify-center py-10 text-gray-600">
        Loading profile...
      </div>
    );
  }

  if (!studentData) {
    return (
      <div className="flex items-center justify-center py-10 text-gray-600">
        No profile data found.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Profile Settings</h2>
        <p className="text-gray-600 mt-1">
          Update your personal information and profile details
        </p>
      </div>

      <div className="p-6">
        {/* Profile Image */}
        <div className="flex items-center gap-6 mb-8 pb-6 border-b border-gray-100">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gray-100 border-4 border-gray-200 overflow-hidden">
              {profileImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </div>
            <label className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center cursor-pointer shadow-lg transition-colors">
              <Camera className="w-4 h-4" />
              <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
            </label>
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Profile Picture</h3>
            <p className="text-sm text-gray-600">Upload a new profile picture</p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              value={studentData?.name || ""}
              onChange={(e) => handleChange("name", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Enter your full name"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
              <input
                type="email"
                value={studentData?.email || ""}
                disabled
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            <div className="relative">
              <Phone className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
              <input
                type="tel"
                value={studentData?.phone || ""}
                onChange={(e) => handleChange("phone", e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="+250 xxx xxx xxx"
              />
            </div>
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
            <select
              value={studentData?.gender || ""}
              onChange={(e) => handleChange("gender", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
            <div className="relative">
              <Calendar className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
              <input
                type="date"
                value={studentData?.dateOfBirth || ""}
                onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Bio */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
            <div className="relative">
              <FileText className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
              <textarea
                value={studentData?.bio || ""}
                onChange={(e) => handleChange("bio", e.target.value)}
                rows={4}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                placeholder="Tell us about yourself..."
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {hasChanges && (
          <div className="flex flex-col sm:flex-row gap-3 justify-end pt-6 border-t border-gray-100 mt-8">
            <button
              type="button"
              onClick={handleReset}
              disabled={loading}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              Reset Changes
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileSettings;
