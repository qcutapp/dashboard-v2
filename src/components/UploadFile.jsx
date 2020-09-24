import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import * as firebase from "firebase/app";
import "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

firebase.initializeApp(firebaseConfig);

const firebaseStorage = firebase.storage();

export default function UploadFile({ initialUrl, onUpload }) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadUrl, setUploadUrl] = useState(null);

  useEffect(() => {
    setUploadUrl(initialUrl);
  }, [initialUrl]);

  const handleFileUpload = (e) => {
    if (e.target.files.length === 0) return;

    setIsUploading(true);

    const file = e.target.files[0];
    const storageRef = firebaseStorage.ref().child(file.name);

    storageRef
      .put(file)
      .then(async (snapshot) => {
        toast.success("Image uploaded!");

        const url = await snapshot.ref.getDownloadURL();

        setUploadUrl(url);
        onUpload(url);
      })
      .catch((err) => {
        toast.error(err.message);
      })
      .finally(() => {
        setIsUploading(false);
      });
  };

  return (
    <div className="form-file">
      <input
        type="file"
        className="form-file-input"
        id="fileUpload"
        onChange={handleFileUpload}
        hidden
      />
      {!uploadUrl ? (
        <label className="form-file-label" htmlFor="fileUpload">
          <span
            className={`btn btn-secondary form-file-button ${
              isUploading && "disabled"
            }`}
            onClick={(e) => isUploading && e.preventDefault()}
          >
            {isUploading ? "Uploading..." : "Upload"}
          </span>
        </label>
      ) : (
        <>
          <div
            className="img-preview"
            style={{ backgroundImage: `url(${uploadUrl})` }}
          ></div>
          <div
            className="btn btn-link"
            onClick={(e) => {
              setUploadUrl(null);
            }}
          >
            Remove
          </div>
        </>
      )}
    </div>
  );
}
