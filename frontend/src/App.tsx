import { useEffect, useState } from "react";
import { sessionState, useChatSession } from "@chainlit/react-client";
import { Playground } from "./components/playground";
import { useRecoilValue } from "recoil";

const userEnv = {};

function App() {
  const { connect } = useChatSession();
  const session = useRecoilValue(sessionState);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  useEffect(() => {
    if (session?.socket.connected) {
      return;
    }
    fetch("http://localhost:80/custom-auth", { credentials: "include" })
      .then(() => {
        connect({
          userEnv,
        });
      });
  }, [connect]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };

  const handleFileUpload = () => {
    if (selectedFile) {
      const formData = new FormData();
      formData.append("file", selectedFile);

      // Replace with your actual API endpoint for file upload
      fetch("http://localhost:80/upload", {
        method: "POST",
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("File uploaded successfully:", data);
          setUploadedFiles((prevFiles) => [...prevFiles, selectedFile.name]); // Add file to the list
          setSelectedFile(null); // Clear selected file
        })
        .catch((error) => {
          console.error("Error uploading file:", error);
        });
    } else {
      console.warn("No file selected");
    }
  };

  const handleFileDelete = (fileName) => {
    setUploadedFiles((prevFiles) =>
      prevFiles.filter((file) => file !== fileName)
    );
    console.log("File deleted:", fileName);
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Chat Section */}
      <div style={{ flex: 1, padding: "20px", borderRight: "1px solid #ccc" }}>
        <Playground />
      </div>

      {/* File Upload and Management Section */}
      <div style={{ flex: 1, padding: "20px" }}>
        <h2>File Management</h2>
        <div style={{ marginBottom: "20px" }}>
          <input
            type="file"
            onChange={handleFileChange}
            style={{ display: "none" }}
            id="file-upload"
          />
          <label htmlFor="file-upload" style={{ cursor: "pointer" }}>
            <button
              style={{
                padding: "10px 20px",
                backgroundColor: "#007bff",
                color: "#fff",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Choose File
            </button>
          </label>
          <button
            onClick={handleFileUpload}
            style={{
              marginLeft: "10px",
              padding: "10px 20px",
              backgroundColor: "#28a745",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Upload File
          </button>
        </div>

        {/* Uploaded Files List */}
        <div>
          <h3>Uploaded Files</h3>
          {uploadedFiles.length > 0 ? (
            <ul style={{ listStyle: "none", padding: 0 }}>
              {uploadedFiles.map((file, index) => (
                <li
                  key={index}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px",
                    borderBottom: "1px solid #eee",
                  }}
                >
                  <span>{file}</span>
                  <button
                    onClick={() => handleFileDelete(file)}
                    style={{
                      padding: "5px 10px",
                      backgroundColor: "#dc3545",
                      color: "#fff",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer",
                    }}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No files uploaded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
