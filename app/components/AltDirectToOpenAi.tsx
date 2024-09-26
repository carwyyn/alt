'use client';

import { Button, FileInput } from "flowbite-react";
import Image from 'next/image';
import { useRef } from 'react';
import * as React from 'react';

interface ChatGPTResponse {
  reply?: string;
  message?: string;
}

export function Steps() {
  const [file, setFile] = React.useState<File | null>(null);
  const [imagePreview, setImagePreview] = React.useState<string | null>('/logo.png');
  const [reply, setReply] = React.useState<string>('Press generate to get a description');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Function to handle file selection and set image preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);

      // Create a preview of the selected image
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string); // Ensure result is a string
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUpload = async () => {
    setReply("Working on it...");
    if (file) {
      try {
        // Convert the image file to a base64-encoded string
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Image = reader.result?.toString().split(',')[1]; // Get the base64 string without the prefix
          
          if (base64Image) {
            // Send the base64 image to the OpenAI API
            const fetchResponse = await fetch('/api/chatgpt', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ image_base64: base64Image }), // Send base64 image to the API
            });

            const data: ChatGPTResponse = await fetchResponse.json();
            if (fetchResponse.ok) {
              setReply(data.reply || '');
            } else {
              console.error('Error:', data.message);
              alert(`Error: ${data.message}`);
            }
          }
        };

        reader.readAsDataURL(file); // Read the image file as a Data URL
      } catch (error) {
        console.error('Error during uploading or sending image:', error);
        alert('An error occurred while uploading the file or sending the image.');
      }
    }
  };

  // Function to copy text to the clipboard
  const handleCopyClick = () => {
    const textToCopy = reply; // Get the text from the state or textarea
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy)
        .catch((err) => {
          console.error('Failed to copy text: ', err);
        });
    }
  };

  return (
    <section className="bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-screen-xl px-4 py-8 lg:px-6 lg:py-2">
        <div className="space-y-8 sm:gap-6 lg:grid lg:grid-cols-3 lg:space-y-0 xl:gap-10">
          <div className="mx-auto flex max-w-lg flex-col rounded-lg border border-gray-100 bg-white p-6 text-center text-gray-900 shadow dark:border-gray-600 dark:bg-gray-800 dark:text-white xl:p-8">
            <h3 className="mb-4 text-2xl font-semibold">Select</h3>
            <p className="text-gray-500 dark:text-gray-400 sm:text-lg">
              Choose your photo from your files
            </p>
            <div className="flex w-full items-center justify-center mt-8">
              <FileInput
                id="file"
                onChange={handleFileChange}
              />
            </div>
          </div>

          <div className="mx-auto flex max-w-lg flex-col rounded-lg border border-gray-100 bg-white p-6 text-center text-gray-900 shadow dark:border-gray-600 dark:bg-gray-800 dark:text-white xl:p-8">
            <h3 className="mb-4 text-2xl font-semibold">Preview</h3>
            <p className="text-gray-500 dark:text-gray-400 sm:text-lg">
              Your photo will be shown here. If you&#39;re happy, press Generate
            </p>

            <Image
              className="max-w-lg rounded-lg w-full relative"
              width={300}
              height={300}
              src={imagePreview || '/imagePlaceholder.png'}
              alt="image description"
            />

            <Button className="mt-8" onClick={handleUpload}>Generate</Button>
          </div>

          <div className="mx-auto flex max-w-lg flex-col rounded-lg border border-gray-100 bg-white p-6 text-center text-gray-900 shadow dark:border-gray-600 dark:bg-gray-800 dark:text-white xl:p-8">
            <h3 className="mb-4 text-2xl font-semibold">Result</h3>
            <p className="text-gray-500 dark:text-gray-400 sm:text-lg mb-8">
              Your alt-text will be shown here. Click the button to copy it to your clipboard.
            </p>

            <p
              id="messageReply"
              className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            >
              {reply}
            </p>

            <Button id="copyMe" className="mt-8" onClick={handleCopyClick}>
              Copy
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
