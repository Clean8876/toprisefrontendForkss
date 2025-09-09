'use client';

import { Button } from "@/components/ui/button";
import { FileUp, ImageUp, X } from "lucide-react";
import React, { ChangeEvent, useState, useEffect } from "react";
import { 
  uploadBulkCategories,
  uploadBulkSubCategories,
  uploadBulkBrands,
  uploadBulkModels,
  uploadBulkVariants
} from "@/service/product-Service";
import { useToast as useGlobalToast } from "@/components/ui/toast";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
  } from "@/components/ui/dialog";
import { useAppSelector } from "@/store/hooks";
import { useRouter } from "next/navigation";



interface UploadBulkCardProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'upload' | 'edit'|'uploadDealer';
  contentType?: 'Category' | 'Subcategory' | 'Brand' | 'Model' | 'Variant' | 'Product';
}


export default function ContentMangementBulk ({ isOpen, onClose, mode = 'upload', contentType = 'Product' }: UploadBulkCardProps) {
  const {showToast} = useGlobalToast();
  const [imageZipFile, setImageZipFile] = useState<File | null>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const auth = useAppSelector((state) => state.auth.user);
  const [uploadMessage, setUploadMessage] = useState('');
  const [logs, setLogs] = useState<any[]>([]);
  const [isLogOpen, setIsLogOpen] = useState(false);
  const route = useRouter();


  const imageInputRef = React.useRef<HTMLInputElement>(null);
  const csvInputRef = React.useRef<HTMLInputElement>(null);
    const allowedRoles = [ "Super-admin", "Inventory-Admin"];

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      resetState();
    }
  }, [isOpen]);
// Handle file change for both image and CSV files
    const handleFileChange = (event: ChangeEvent<HTMLInputElement>, fileType: string) => {
    const files = event.target.files;
    const file = files && files[0];
    if (file) {
      if (fileType === 'image') {
        setImageZipFile(file);
      } else {
        setCsvFile(file);
      }
    }
  };
    const resetState = () => {
    setImageZipFile(null);
    setCsvFile(null);
    setIsUploading(false);
    setUploadMessage('');
    // Clear file input values
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
    if (csvInputRef.current) {
      csvInputRef.current.value = '';
    }
  };
   const handleClose = () => {
    resetState();
    onClose();
  };
    const handleUpload = async () => {
      // Ensure both files are selected before uploading
      if (mode === 'edit' && !csvFile) {
        setUploadMessage('Please select the CSV file for editing.');
        return;
      }
        if (mode === 'uploadDealer' && !csvFile) {
        setUploadMessage('Please select the CSV file for editing.');
        return;
      }
      if (mode === 'upload' && (!imageZipFile || !csvFile)) {
        setUploadMessage('Please select the Image.zip file and CSV file for upload.');
        return;
      }

      setIsUploading(true);
      setUploadMessage('');

      // Show initial loading message
      if (mode === 'edit') {
        setUploadMessage('🔄 Processing CSV file for bulk edit...');
      } else if (mode === 'uploadDealer') {
        setUploadMessage('🔄 Processing dealer CSV file...');
      } else {
        setUploadMessage(`🔄 Processing ${contentType} files for bulk upload...`);
      }

      const formData = new FormData();
      if (mode === 'upload') {
        if (imageZipFile) {
          formData.append('imageZip', imageZipFile);
        }
        if (csvFile) {
          formData.append('dataFile', csvFile);
        }
      }
      if (mode === 'edit') {
        if (csvFile) {
          formData.append('editsFile', csvFile);
        }
      }
      if (mode === 'uploadDealer') {
        if (csvFile) {
          formData.append('file', csvFile);
        }
      }
   

      try {
        let response;
        if (mode === 'edit') {
          // TODO: Implement edit bulk products API call
          showToast("Edit functionality not implemented yet", "warning");
          console.log('Edit bulk upload with formData:');
        }
        else if (mode === 'uploadDealer') {
          // TODO: Implement upload dealer bulk API call
          showToast("Upload dealer functionality not implemented yet", "warning");
          console.log('Upload dealer bulk upload with formData:');
        }
        else {
          // Handle different content types for bulk upload
          switch (contentType) {
            case 'Category':
              response = await uploadBulkCategories(formData);
              break;
            case 'Subcategory':
              response = await uploadBulkSubCategories(formData);
              break;
            case 'Brand':
              response = await uploadBulkBrands(formData);
              break;
            case 'Model':
              response = await uploadBulkModels(formData);
              break;
            case 'Variant':
              response = await uploadBulkVariants(formData);
              break;
            case 'Product':
            default:
              // TODO: Implement upload bulk products API call
              showToast("Upload products functionality not implemented yet", "warning");
              console.log('Upload bulk products with formData:');
              break;
          }
          showToast("Uploaded successfully", "success");
          console.log(`Uploading bulk ${contentType} with formData:`);
        }

        if (response) {
          setUploadMessage(response.message || (mode === 'edit' ? 'Files edited successfully!' : mode === 'uploadDealer' ? 'Dealer files uploaded successfully!' : `${contentType} files uploaded successfully!`));
          setImageZipFile(null);
          setCsvFile(null);
          handleClose();
            // if (mode === 'uploadDealer') {
            // route.push(`/user/dashboard/product`);
            // } else {
            // route.push(`/user/dashboard/product/Logs`);
            // }
          // const logsResponse = await getProductLogs();
          // setLogs(logsResponse.data);
          setIsLogOpen(true);
         
        } else {
          setUploadMessage((mode === 'edit' ? 'Edit failed. Please try again.' : mode === 'uploadDealer' ? 'Dealer failed. Please try again.': `${contentType} upload failed. Please try again.`));
        }
      } catch (error: any) {
        console.error('Error uploading files:', error);
        showToast( 'An error occurred during upload. Please check the console.', "error");
        const message = error.response?.data?.message || error.message || 'An error occurred during upload. Please check the console.';
        setUploadMessage(message);
      } finally {
        setIsUploading(false);
      }
    };
   const handleRemoveFile = (fileType: string) => {
    if (fileType === 'image') {
      setImageZipFile(null);
      if(imageInputRef.current) imageInputRef.current.value = '';
    } else {
      setCsvFile(null);
      if(csvInputRef.current) csvInputRef.current.value = '';
    }
  };
  if (!auth || !allowedRoles.includes(auth.role)) {
    return (
       <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px]">
        <div className="text-xl text-red-600 font-bold">
          You do not have permission to access.
        </div></DialogContent>
      </Dialog>
    );
  }
return (
  <>
    <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle className="text-2xl font-semibold text-gray-800">Upload {contentType} File</DialogTitle>
      </DialogHeader>
      <div className="space-y-6 py-4">
        <p className="text-gray-500">Drag and drop the files as per the requirement</p>
        <div className="flex flex-col md:flex-row gap-4">
          {/* Only show image upload if not uploadDealer mode */}
          {mode !== 'uploadDealer' && (
            <div 
              className={`flex-1 flex flex-col items-center justify-center p-8 rounded-lg border-2 border-dashed transition-colors duration-200 ${
                  imageZipFile ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50 text-red-600 hover:bg-red-100'
                } cursor-pointer`}
              onClick={() => imageInputRef.current?.click()}
            >
              {imageZipFile ? (
                <div className="text-center">
                  <p className="text-sm font-medium">{imageZipFile.name}</p>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleRemoveFile('image'); }}
                    className="mt-2 text-red-500 hover:text-red-700"
                  >
                    <X size={20} />
                  </button>
                </div>
              ) : (
                <>
                  <ImageUp className="w-12 h-12 mb-2" />
                  <span className="text-lg font-medium">Upload Image.zip file</span>
                </>
              )}
              <input
                type="file"
                ref={imageInputRef}
                onChange={(e) => handleFileChange(e, 'image')}
                className="hidden"
                accept=".zip"
              />
            </div>
          )}

          {/* Upload CSV file section (always shown, but label changes for uploadDealer) */}
          <div 
            className={`flex-1 flex flex-col items-center justify-center p-8 rounded-lg border-2 border-dashed transition-colors duration-200 ${
                csvFile ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
              } cursor-pointer`}
            onClick={() => csvInputRef.current?.click()}
          >
             {csvFile ? (
              <div className="text-center">
                <p className="text-sm font-medium">{csvFile.name}</p>
                <button
                  onClick={(e) => { e.stopPropagation(); handleRemoveFile('csv'); }}
                  className="mt-2 text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>
            ) : (
              <>
                <FileUp className="w-12 h-12 mb-2" />
                <span className="text-lg font-medium">{mode === 'uploadDealer' ? 'Upload Dealer CSV file' : `Upload ${contentType} CSV file`}</span>
              </>
            )}
            <input
              type="file"
              ref={csvInputRef}
              onChange={(e) => handleFileChange(e, 'csv')}
              className="hidden"
              accept=".csv"
            />
          </div>
        </div>
        {uploadMessage && <p className="text-center text-sm text-gray-600 pt-2">{uploadMessage}</p>}
      </div>
      <DialogFooter className="flex justify-end gap-3 pt-4">
        <Button variant="outline" onClick={handleClose}>Cancel</Button>
        <Button
          className="bg-red-600 text-white hover:bg-red-700"
          disabled={
            (mode === 'edit' || mode === 'uploadDealer'
              ? !csvFile
              : !imageZipFile || !csvFile
            ) || isUploading
          }
          onClick={handleUpload}
        >
          {isUploading
            ? (mode === 'edit'
                ? 'Editing...'
                : mode === 'uploadDealer'
                  ? 'Uploading...'
                  : `Uploading ${contentType}...`)
            : (mode === 'edit'
                ? 'Edit Bulk'
                : mode === 'uploadDealer'
                  ? 'Upload Dealer CSV'
                  : `Upload ${contentType}`)}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
  </>
)

}

