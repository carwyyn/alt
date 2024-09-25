"use client";

import * as React from 'react';
import { FileInput, Label, Button } from "flowbite-react";
import { useEdgeStore } from '../../lib/edgestore';
import Image from 'next/image';

interface ChatGPTResponse {
  reply?: string;
  message?: string;
}

export default function UploadFile() {
  const [file, setFile] = React.useState<File | null>(null);
  const [imagePreview, setImagePreview] = React.useState<string | ArrayBuffer | null>(null);
  const { edgestore } = useEdgeStore();
  const [reply, setReply] = React.useState<string>('Waiting');

  // Handle file change and image preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);

      // Create a preview of the selected image
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (file && edgestore?.publicFiles?.upload) {
      try {
        // Upload the file to EdgeStore
        const uploadResponse = await edgestore.publicFiles.upload({
          file,
          onProgressChange: (progress) => {
            console.log(progress);
          },
        });

        console.log(uploadResponse.url);

        // Send the uploaded image URL to the /api/chatgpt route
        const fetchResponse = await fetch('/api/chatgpt', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: uploadResponse.url }), // Directly send the upload URL here
        });

        const data: ChatGPTResponse = await fetchResponse.json();
        if (fetchResponse.ok) {
          setReply(data.reply || '');
        } else {
          console.error('Error:', data.message);
          alert(`Error: ${data.message}`);
        }
      } catch (error) {
        console.error('Error during upload or sending message:', error);
        alert('An error occurred while uploading the file or sending the message.');
      }
    }
  };

  return (
    <form id="fileUpload" className="max-w-md">
      <div className="mb-2 block">
        <Label htmlFor="file" value="Upload file" />
      </div>
      <FileInput
        id="file"
        helperText="A profile picture is useful to confirm you are logged into your account"
        onChange={handleFileChange}
      />
      <Button onClick={handleUpload}>
        Upload
      </Button>

      {/* Render the image preview */}
      {typeof imagePreview === 'string' && (
        <div>
          <div className="mt-4">
            <Image
              src={imagePreview}
              alt="Image Preview"
              width={300}
              height={300}
              className="object-contain"
            />
          </div>
          <div className="mt-4 p-2 border rounded">
            <strong>ChatGPT:</strong>
            <p>{reply}</p>
          </div>
        </div>
      )}
    </form>
  );
}
