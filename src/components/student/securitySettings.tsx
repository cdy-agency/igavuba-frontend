// "use client";

// import React, { useState } from "react";
// import { Lock, Eye, EyeOff, Shield } from "lucide-react";
// import { updateStudentPassword } from "@/lib/api/student"; 
// import {toast} from "react-toastify"

// type PasswordField = "oldPassword" | "newPassword" | "confirmPassword";

// const Security: React.FC = () => {
//   const [passwordData, setPasswordData] = useState<Record<PasswordField, string>>({
//   oldPassword: "",
//   newPassword: "",
//   confirmPassword: "",
// });

//   const [showPasswords, setShowPasswords] = useState({
//     oldPassword: false,
//     newPassword: false,
//     confirmPassword: false,
//   });

//   const [loading, setLoading] = useState(false);
//   const [errors, setErrors] = useState<{ [key: string]: string }>({});

//   const handleChange = (field: PasswordField, value: string) => {
//   setPasswordData((prev) => ({ ...prev, [field]: value }));
//   if (errors[field]) {
//     setErrors((prev) => ({ ...prev, [field]: "" }));
//   }
// };

//   const togglePasswordVisibility = (field: PasswordField) => {
//   setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
// };

//   const validateForm = () => {
//     const newErrors: { [key: string]: string } = {};

//     if (!passwordData.oldPassword) {
//       newErrors.oldPassword = "Current password is required";
//     }

//     if (!passwordData.newPassword) {
//       newErrors.newPassword = "New password is required";
//     } else if (passwordData.newPassword.length < 6) {
//       newErrors.newPassword = "Password must be at least 8 characters long";
//     }

//     if (!passwordData.confirmPassword) {
//       newErrors.confirmPassword = "Please confirm your new password";
//     } else if (passwordData.newPassword !== passwordData.confirmPassword) {
//       newErrors.confirmPassword = "Passwords do not match";
//     }

//     if (passwordData.oldPassword === passwordData.newPassword) {
//       newErrors.newPassword = "New password must be different from current password";
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!validateForm()) return;

//     try {
//       setLoading(true);
//       await updateStudentPassword({
//         oldPassword: passwordData.oldPassword,
//         newPassword: passwordData.newPassword,
//       });

//       // Reset form
//       setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
//       toast.success("Password updated successfully!")
//     } catch (error: any) {
//       toast.error("Failed to Update Password")
//       setErrors({ submit: error.response?.data?.message || error.message });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleReset = () => {
//     setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
//     setErrors({});
//   };

//   const hasChanges =
//     passwordData.oldPassword || passwordData.newPassword || passwordData.confirmPassword;

//   return (
//     <div className="bg-background rounded-xl shadow-sm border border-border">
//       <div className="p-6 border-b border-border">
//         <h2 className="text-xl font-semibold text-foreground">Security Settings</h2>
//         <p className="text-muted-foreground mt-1">Update your account password</p>
//       </div>

//       <div className="p-6">
//         <form onSubmit={handleSubmit} className="space-y-6">
//           {/* Current Password */}
//           <div>
//             <label className="block text-sm font-medium text-foreground-muted mb-2">
//               Current Password
//             </label>
//             <div className="relative">
//               <Lock className="w-5 h-5 text-muted-foreground absolute left-3 top-3.5" />
//               <input
//                 type={showPasswords.oldPassword ? "text" : "password"}
//                 value={passwordData.oldPassword}
//                 onChange={(e) => handleChange("oldPassword", e.target.value)}
//                 className={`w-full pl-11 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors ${
//                   errors.oldPassword ? "border-destructive" : "border-border"
//                 }`}
//                 placeholder="Enter your current password"
//               />
//               <button
//                 type="button"
//                 onClick={() => togglePasswordVisibility("oldPassword")}
//                 className="absolute right-3 top-3.5 text-muted-foreground hover:text-muted-foreground"
//               >
//                 {showPasswords.oldPassword ? (
//                   <EyeOff className="w-5 h-5" />
//                 ) : (
//                   <Eye className="w-5 h-5" />
//                 )}
//               </button>
//             </div>
//             {errors.oldPassword && (
//               <p className="mt-1 text-sm text-destructive">{errors.oldPassword}</p>
//             )}
//           </div>

//           {/* New Password */}
//           <div>
//             <label className="block text-sm font-medium text-foreground-muted mb-2">
//               New Password
//             </label>
//             <div className="relative">
//               <Lock className="w-5 h-5 text-muted-foreground absolute left-3 top-3.5" />
//               <input
//                 type={showPasswords.newPassword ? "text" : "password"}
//                 value={passwordData.newPassword}
//                 onChange={(e) => handleChange("newPassword", e.target.value)}
//                 className={`w-full pl-11 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors ${
//                   errors.newPassword ? "border-destructive" : "border-border"
//                 }`}
//                 placeholder="Enter your new password"
//               />
//               <button
//                 type="button"
//                 onClick={() => togglePasswordVisibility("newPassword")}
//                 className="absolute right-3 top-3.5 text-muted-foreground hover:text-muted-foreground"
//               >
//                 {showPasswords.newPassword ? (
//                   <EyeOff className="w-5 h-5" />
//                 ) : (
//                   <Eye className="w-5 h-5" />
//                 )}
//               </button>
//             </div>
//             {errors.newPassword && (
//               <p className="mt-1 text-sm text-destructive">{errors.newPassword}</p>
//             )}
//             <p className="mt-1 text-sm text-muted-foreground">
//               Password must be at least 8 characters long
//             </p>
//           </div>

//           {/* Confirm New Password */}
//           <div>
//             <label className="block text-sm font-medium text-foreground-muted mb-2">
//               Confirm New Password
//             </label>
//             <div className="relative">
//               <Lock className="w-5 h-5 text-muted-foreground absolute left-3 top-3.5" />
//               <input
//                 type={showPasswords.confirmPassword ? "text" : "password"}
//                 value={passwordData.confirmPassword}
//                 onChange={(e) => handleChange("confirmPassword", e.target.value)}
//                 className={`w-full pl-11 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors ${
//                   errors.confirmPassword ? "border-destructive" : "border-border"
//                 }`}
//                 placeholder="Confirm your new password"
//               />
//               <button
//                 type="button"
//                 onClick={() => togglePasswordVisibility("confirmPassword")}
//                 className="absolute right-3 top-3.5 text-muted-foreground hover:text-muted-foreground"
//               >
//                 {showPasswords.confirmPassword ? (
//                   <EyeOff className="w-5 h-5" />
//                 ) : (
//                   <Eye className="w-5 h-5" />
//                 )}
//               </button>
//             </div>
//             {errors.confirmPassword && (
//               <p className="mt-1 text-sm text-destructive">{errors.confirmPassword}</p>
//             )}
//           </div>

//           {/* Submit Error */}
//           {errors.submit && (
//             <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
//               <p className="text-sm text-destructive">{errors.submit}</p>
//             </div>
//           )}

//           {/* Action Buttons */}
//           {hasChanges && (
//             <div className="flex flex-col sm:flex-row gap-3 justify-end pt-6 border-t border-border">
//               <button
//                 type="button"
//                 onClick={handleReset}
//                 disabled={loading}
//                 className="px-6 py-3 bg-muted hover:bg-muted text-foreground-muted rounded-lg font-medium transition-colors disabled:opacity-50"
//               >
//                 Reset
//               </button>
//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="px-6 py-3 bg-primary hover:bg-primary-hover text-panel-foreground rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
//               >
//                 {loading && (
//                   <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                 )}
//                 <Shield className="w-4 h-4" />
//                 Update Password
//               </button>
//             </div>
//           )}
//         </form>
//       </div>
//     </div>
//   );
// };

// export default Security;
