// import React, { createContext, useState, useContext, useEffect } from "react";
// import { IInstitution, ICourse, IEnrollment } from "@/types/education";
// import axios from "axios";
// import { API_URL } from "@/lib/axios";

// interface EducationContextTypes {
//   institution: IInstitution[];
//   selectedInstitution: IInstitution | null;
//   setSelectedInstitution: (institution: IInstitution | null) => void;
//   course: ICourse[];
//   enrollment: IEnrollment[];
//   fetchInstitution: () => Promise<void>; 
//   fetchCourseByInstitution: (id: string) => void;
//   getEnrolledCourse:() => void
//   enrollInCourse: (courseId: string) => Promise<void>;
//   loadingEducation: boolean;
// }

// const EducationContext = createContext<EducationContextTypes | undefined>(undefined);

// export const EducationProvider = ({ children }: { children: React.ReactNode }) => {
//   const [institution, setInstitution] = useState<IInstitution[]>([]);
//   const [selectedInstitution, setSelectedInstitution] = useState<IInstitution | null>(null);
//   const [course, setCourse] = useState<ICourse[]>([]);
//   const [enrollment, setEnrollment] = useState<IEnrollment[]>([]);
//   const [loadingEducation, setLoadingEducation] = useState<boolean>(false);

//   const fetchInstitution = async () => {
//     setLoadingEducation(true);
//     try {
//       const res = await axios.get(`${API_URL}/api/institutions`);
//       setInstitution(res.data);  
//     } catch (error) {
//       console.log("Failed to fetch institutions", error);
//     } finally {
//       setLoadingEducation(false);
//     }
//   };

//   const fetchCourseByInstitution = async (id: string) => {  
//     try {
//       const res = await axios.get(`${API_URL}/api/institutions/${id}`);
//       setCourse(res.data);
//     } catch (error) {
//       console.error("Failed to fetch courses", error);
//     } finally {
//       setLoadingEducation(false);
//     }
//   };

//   const enrollInCourse = async (courseId: string,) => {
//     setLoadingEducation(true);
//     try {
//       const res = await axios.post(`${API_URL}/api/enrollement/${courseId}`,{},{
//         headers:{
//           "Authorization":`Bearer ${localStorage.getItem('token')}`
//         }
//       }); 
//       setEnrollment((prev) => [...prev, res.data]);
//     } catch (error:any) {
//       console.error("Enrollment failed", error.message);
//     } finally {
//       setLoadingEducation(false);
//     }
//   };

//   const getEnrolledCourse = async()=>{
//     setLoadingEducation(true)
//     try {
//       const res = await axios.get(`${API_URL}/api/enrollement`,{
//         headers:{
//           "Authorization":`Bearer ${localStorage.getItem('token')}`
//         }
//       })
//       setEnrollment(res.data)
//     } catch (error) {
//       console.log("Failed to get enrolled courses")
//     }finally{
//       setLoadingEducation(false)
//     }
//   }

//   const value: EducationContextTypes = {
//     institution,
//     selectedInstitution,
//     setSelectedInstitution,
//     course,
//     enrollment,
//     fetchInstitution,
//     fetchCourseByInstitution,
//     enrollInCourse,
//     loadingEducation,
//     getEnrolledCourse
//   };

//   return (
//     <EducationContext.Provider value={value}>
//       {children}
//     </EducationContext.Provider>
//   );
// };

// // Custom hook
// export const useEducation = () => {
//   const context = useContext(EducationContext);
//   if (context === undefined) {
//     throw new Error("useEducation must be used within an EducationProvider");
//   }
//   return context;
// };