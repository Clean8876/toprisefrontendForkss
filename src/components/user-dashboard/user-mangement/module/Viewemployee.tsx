// "use client"

// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Check } from "lucide-react"
// import { useParams } from "next/navigation"
// import { useState, useEffect } from "react"
// import { getEmployeeById } from "@/service/employeeServices"
// import type { Employee, User } from "@/types/employee-types"
// import Image from "next/image"

// export default function Viewemployee() {
//   const params = useParams()
//   const employeeId = params.id as string

//   const [employeeDetails, setEmployeeDetails] = useState<Employee | null>(null)
//   const [isLoading, setIsLoading] = useState(true)
//   const [error, setError] = useState<Error | null>(null)

//   useEffect(() => {
//     if (!employeeId) {
//       setIsLoading(false)
//       return
//     }

//     const fetchEmployee = async () => {
//       setIsLoading(true)
//       setError(null)
//       try {
//         const response = await getEmployeeById(employeeId)
//         setEmployeeDetails(response.data || null)
//       } catch (err: any) {
//         console.error("Failed to fetch employee details:", err)
//         setError(err)
//       } finally {
//         setIsLoading(false)
//       }
//     }
//     fetchEmployee()
//   }, [employeeId]) 

//   if (isLoading) {
//     return <div className="flex justify-center items-center h-screen text-gray-500">Loading employee details...</div>
//   }

//   if (error) {
//     return (
//       <div className="flex justify-center items-center h-screen text-red-500">
//         Failed to load employee details: {error.message}
//       </div>
//     )
//   }

//   if (!employeeDetails) {
//     return <div className="flex justify-center items-center h-screen text-gray-500">Employee not found.</div>
//   }

//   // Safely access user_id if it's an object
//   const userIdInfo = typeof employeeDetails.user_id === "object" ? (employeeDetails.user_id as User) : null

//   return (
//     <div className="flex-1 p-4 md:p-6 bg-gray-50 min-h-screen">
//       {/* Header for Employee Overview */}
//       <div className="flex items-center justify-between mb-6">
//         <div>
//           <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Employee Overview</h1>
//           <p className="text-sm text-gray-500">See the employee details and access</p>
//         </div>
//         <Button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg shadow-sm">Edit</Button>
//       </div>
//       {/* Main content grid */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Left Column */}
//         <div className="lg:col-span-2 space-y-6">
//           {/* Personal & Contact Information */}
//           <Card className="border-gray-200 shadow-sm">
//             <CardHeader className="flex flex-row items-center justify-between pb-2">
//               <CardTitle className="text-black-600 font-semibold text-lg">Personal & Contact Information</CardTitle>
//               <span
//                 className={`px-3 py-1 rounded-full text-xs font-medium ${
//                   employeeDetails.status === "Active" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
//                 }`}
//               >
//                 {employeeDetails.status || "N/A"}
//               </span>
//             </CardHeader>
//             <CardContent className="flex flex-col sm:flex-row gap-6">
//               <Image
//                 src="/assets/FAQ.png"
//                 alt="Employee Profile"
//                 width={96}
//                 height={96}
//                 className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
//               />
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 flex-grow">
//                 <div className="flex flex-col">
//                   <span className="text-sm font-medium text-gray-700">Full Name</span>
//                   <span className="text-gray-900">{employeeDetails.First_name}</span>
//                 </div>
//                 <div className="flex flex-col">
//                   <span className="text-sm font-medium text-gray-700">Employee ID</span>
//                   <span className="text-gray-900">{employeeDetails.employee_id}</span>
//                 </div>
//                 <div className="flex flex-col">
//                   <span className="text-sm font-medium text-gray-700">Mobile Number</span>
//                   <span className="text-gray-900">{employeeDetails.mobile_number}</span>
//                 </div>
//                 <div className="flex flex-col">
//                   <span className="text-sm font-medium text-gray-700">Email ID</span>
//                   <span className="text-gray-900">{employeeDetails.email}</span>
//                 </div>
//                 <div className="flex flex-col">
//                   <span className="text-sm font-medium text-gray-700">Designation</span>
//                   <span className="text-gray-900">{employeeDetails.designation || employeeDetails.role}</span>
//                 </div>
//                 <div className="flex flex-col">
//                   <span className="text-sm font-medium text-gray-700">Department</span>
//                   <span className="text-gray-900">
//                     {employeeDetails.department ||
//                       (employeeDetails.role === "Sales"
//                         ? "Sales"
//                         : employeeDetails.role === "Fulfillment-Staff"
//                           ? "Fulfillment"
//                           : "General")}
//                   </span>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//           {/* Login & Status */}
//           <Card className="border-gray-200 shadow-sm">
//             <CardHeader>
//               <CardTitle className="text-black-600 font-semibold text-lg">Login & Status</CardTitle>
//             </CardHeader>
//             <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
//               <div className="flex items-center gap-2">
//                 {employeeDetails.sendLoginInvite ? (
//                   <Check className="w-4 h-4 text-green-600" />
//                 ) : (
//                   <div className="w-4 h-4 border border-gray-300 rounded" />
//                 )}
//                 <span className="text-sm font-medium text-gray-700">Send Login Invite</span>
//               </div>
//               <div className="flex flex-col">
//                 <span className="text-sm font-medium text-gray-700">Set Temporary Password</span>
//                 <span className="text-gray-900">{employeeDetails.temporaryPassword || "••••••••••"}</span>
//               </div>
//               <div className="flex flex-col">
//                 <span className="text-sm font-medium text-gray-700">Current Status</span>
//                 <span className="text-gray-900">{employeeDetails.currentStatus || "N/A"}</span>
//               </div>
//               <div className="flex flex-col">
//                 <span className="text-sm font-medium text-gray-700">Last Login</span>
//                 <span className="text-gray-900">
//                   {employeeDetails.last_login ? new Date(employeeDetails.last_login).toLocaleString() : "N/A"}
//                 </span>
//               </div>
//               <div className="flex flex-col">
//                 <span className="text-sm font-medium text-gray-700">Created By</span>
//                 <span className="text-gray-900">
//                   {employeeDetails.createdBy || (userIdInfo ? userIdInfo._id : "N/A")}
//                 </span>
//               </div>
//             </CardContent>
//           </Card>
//           {/* Notes & Admin Controls */}
//           <Card className="border-gray-200 shadow-sm">
//             <CardHeader>
//               <CardTitle className="text-black-600 font-semibold text-lg">Notes & Admin Controls</CardTitle>
//             </CardHeader>
//             <CardContent className="grid grid-cols-1 gap-x-6 gap-y-4">
//               <div className="flex flex-col">
//                 <span className="text-sm font-medium text-gray-700">Remarks</span>
//                 <span className="text-gray-900">{employeeDetails.remarks || "N/A"}</span>
//               </div>
//               <div className="flex flex-col">
//                 <span className="text-sm font-medium text-gray-700">Audit Trail</span>
//                 <span className="text-gray-900">{employeeDetails.auditTrail || "N/A"}</span>
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//         {/* Right Column */}
//         <div className="lg:col-span-1 space-y-6">
//           {/* Role & Access Permissions */}
//           <Card className="border-gray-200 shadow-sm">
//             <CardHeader>
//               <CardTitle className="text-black-600 font-semibold text-lg">Role & Access Permissions</CardTitle>
//             </CardHeader>
//             <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
//               <div className="flex flex-col">
//                 <span className="text-sm font-medium text-gray-700">Role</span>
//                 <span className="text-gray-900">{employeeDetails.role}</span>
//               </div>
//               <div className="flex flex-col">
//                 <span className="text-sm font-medium text-gray-700">Access Level</span>
//                 <span className="text-gray-900">{employeeDetails.accessLevel || "N/A"}</span>
//               </div>
//               <div className="flex flex-col sm:col-span-2">
//                 <span className="text-sm font-medium text-gray-700">Role Description</span>
//                 <span className="text-gray-900">{employeeDetails.roleDescription || "N/A"}</span>
//               </div>
//             </CardContent>
//           </Card>
//           {/* Operational Scope Mapping */}
//           <Card className="border-gray-200 shadow-sm">
//             <CardHeader>
//               <CardTitle className="text-black-600 font-semibold text-lg">Operational Scope Mapping</CardTitle>
//             </CardHeader>
//             <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
//               <div className="flex flex-col">
//                 <span className="text-sm font-medium text-gray-700">Assigned Dealer</span>
//                 <span className="text-gray-900">{employeeDetails.assigned_dealers.join(", ") || "N/A"}</span>
//               </div>
//               <div className="flex flex-col">
//                 <span className="text-sm font-medium text-gray-700">Assigned Region</span>
//                 <span className="text-gray-900">{employeeDetails.assigned_regions.join(", ") || "N/A"}</span>
//               </div>
//             </CardContent>
//           </Card>
//           {/* Assignment & Task Visibility */}
//           <Card className="border-gray-200 shadow-sm">
//             <CardHeader>
//               <CardTitle className="text-black-600 font-semibold text-lg">Assignment & Task Visibility</CardTitle>
//             </CardHeader>
//             <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
//               <div className="flex flex-col">
//                 <span className="text-sm font-medium text-gray-700">Assigned Orders / Picklists</span>
//                 <span className="text-gray-900">{employeeDetails.assignedOrdersPicklists || "N/A"}</span>
//               </div>
//               <div className="flex flex-col">
//                 <span className="text-sm font-medium text-gray-700">SLA Type</span>
//                 <span className="text-gray-900">{employeeDetails.slaType || "N/A"}</span>
//               </div>
//               <div className="flex flex-col">
//                 <span className="text-sm font-medium text-gray-700">SLA Max Dispatch Time</span>
//                 <span className="text-gray-900">{employeeDetails.slaMaxDispatchTime || "N/A"}</span>
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     </div>
//   )
// }

"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { getEmployeeById } from "@/service/employeeServices"
import type { Employee } from "@/types/employee-types"
import Image from "next/image"
import { Skeleton } from "@/components/ui/skeleton"

export default function ViewEmployee() {
  const router = useRouter()
  const params = useParams()
  const employeeId = params.id as string

  const [employee, setEmployee] = useState<Employee | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!employeeId) {
      setIsLoading(false)
      return
    }

    const fetchEmployee = async () => {
      try {
        setIsLoading(true)
        const response = await getEmployeeById(employeeId)
        setEmployee(response.data || null)
      } catch (err) {
        console.error("Failed to fetch employee:", err)
        setError(err as Error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchEmployee()
  }, [employeeId])

  const handleEdit = () => {
    router.push(`/dashboard/employees/edit-employee/${employeeId}`)
  }

  if (isLoading) {
    return (
      <div className="flex-1 p-4 md:p-6 bg-gray-50 min-h-screen">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-24" />
        </div>

        {/* Main content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column Skeleton */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information Skeleton */}
            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-6 w-20" />
              </CardHeader>
              <CardContent className="flex flex-col sm:flex-row gap-6">
                <Skeleton className="w-24 h-24 rounded-lg" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 flex-grow">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-6 w-full" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Login Information Skeleton */}
            <Card className="border-gray-200 shadow-sm">
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                <div className="flex items-center gap-2">
                  <Skeleton className="w-4 h-4 rounded-full" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column Skeleton */}
          <div className="lg:col-span-1 space-y-6">
            {/* Role Information Skeleton */}
            <Card className="border-gray-200 shadow-sm">
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-full" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        Failed to load employee: {error.message}
      </div>
    )
  }

  if (!employee) {
    return <div className="flex justify-center items-center h-screen text-gray-500">Employee not found</div>
  }

  return (
    <div className="flex-1 p-4 md:p-6 bg-(neutral-100)-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Employee Overview</h1>
          <p className="text-sm text-gray-500">View employee details</p>
        </div>
        <Button 
          onClick={handleEdit}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg shadow-sm"
        >
          Edit
        </Button>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold">Personal Information</CardTitle>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  employee.status === "Active" 
                    ? "bg-green-100 text-green-800" 
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {employee.status || "Inactive"}
              </span>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-6">
              <Image
                src="/assets/FAQ.png"
                alt="Profile"
                width={96}
                height={96}
                className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 flex-grow">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-700">Full Name</span>
                  <span className="text-gray-900">{employee.First_name}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-700">Employee ID</span>
                  <span className="text-gray-900">{employee.employee_id}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-700">Mobile</span>
                  <span className="text-gray-900">{employee.mobile_number || "N/A"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-700">Email</span>
                  <span className="text-gray-900">{employee.email}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-700">Role</span>
                  <span className="text-gray-900">{employee.role}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-700">Department</span>
                  <span className="text-gray-900">{employee.department || employee.role}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Login Information */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Login Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              <div className="flex items-center gap-2">
                {employee.sendLoginInvite ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <div className="w-4 h-4 border border-gray-300 rounded" />
                )}
                <span className="text-sm font-medium text-gray-700">Login Invite Sent</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-700">Last Login</span>
                <span className="text-gray-900">
                  {employee.last_login 
                    ? new Date(employee.last_login).toLocaleString() 
                    : "Never logged in"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-1 space-y-6">
          {/* Role Information */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Role Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-700">Access Level</span>
                <span className="text-gray-900">{employee.accessLevel || "Standard"}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-700">Assigned Dealers</span>
                <span className="text-gray-900">
                  {employee.assigned_dealers?.length 
                    ? employee.assigned_dealers.join(", ") 
                    : "None assigned"}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-700">Assigned Regions</span>
                <span className="text-gray-900">
                  {employee.assigned_regions?.length 
                    ? employee.assigned_regions.join(", ") 
                    : "None assigned"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
