// pages/testMedia.js

import { useState, useEffect } from 'react';
import { constructMediaURL } from '@/services/mediaService/media-service';
import { sendRequest,sendRequestTest } from '@/services/requests/request-service';
import RequestMethod from '@/enums/request-methods';


const TestMedia = () => {
  // State for creating a new resource
  const [createName, setCreateName] = useState('');
  const [createDescription, setCreateDescription] = useState('');
  const [createFiles, setCreateFiles] = useState([]);

  // State for updating an existing resource
  const [updateId, setUpdateId] = useState('');
  const [updateName, setUpdateName] = useState('');
  const [updateDescription, setUpdateDescription] = useState('');
  const [existingMedias, setExistingMedias] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [mediasToDelete, setMediasToDelete] = useState([]);

  // State for displaying responses
  const [createResponse, setCreateResponse] = useState(null);
  const [updateResponse, setUpdateResponse] = useState(null);

  // Fetch existing medias when updating
  useEffect(() => {
    if (updateId) {
      // Replace with your API endpoint to fetch the existing resource by ID
      fetch(`/api/resource/${updateId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setUpdateName(data.data.name);
            setUpdateDescription(data.data.description);
            setExistingMedias(data.data.medias || []);
          } else {
            console.error('Failed to fetch resource:', data.message);
          }
        })
        .catch((error) => console.error('Error fetching resource:', error));
    }
  }, [updateId]);

  // Handlers for Create Form
  const handleCreateFileChange = (e) => {
    setCreateFiles([...e.target.files]);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name: createName,
      description: createDescription,
      medias: createFiles.map((file) => ({ file })),
    };

    const response = await sendRequestTest(
      RequestMethod.POST,
      '/api/resource/create', // Replace with your actual endpoint
      payload,
      true // requireAuth
    );

    setCreateResponse(response);

    if (!response.error) {
      // Reset form
      setCreateName('');
      setCreateDescription('');
      setCreateFiles([]);
    }
  };

  // Handlers for Update Form
  const handleNewFileChange = (e) => {
    setNewFiles([...e.target.files]);
  };

  const toggleMediaDeletion = (objectKey) => {
    if (mediasToDelete.includes(objectKey)) {
      setMediasToDelete(mediasToDelete.filter((key) => key !== objectKey));
    } else {
      setMediasToDelete([...mediasToDelete, objectKey]);
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name: updateName,
      description: updateDescription,
      medias: existingMedias.map((media) => ({
        objectKey: media.objectKey,
      })),
      deleteMedias: mediasToDelete,
      newMedias: newFiles.map((file) => ({ file })),
    };

    const response = await sendRequest(
      RequestMethod.PUT,
      `/api/resource/update/${updateId}`, // Replace with your actual endpoint
      payload,
      true // requireAuth
    );

    setUpdateResponse(response);

    if (!response.error) {
      // Reset form
      setUpdateName('');
      setUpdateDescription('');
      setNewFiles([]);
      setMediasToDelete([]);
      // Optionally, refetch the updated resource
    }
  };

  return (
    <div style={styles.container}>
      <h1>Media Management Interface</h1>

      {/* Create New Resource */}
      <section style={styles.section}>
        <h2>Create New Resource</h2>
        <form onSubmit={handleCreateSubmit} style={styles.form}>
          <input
            type="text"
            placeholder="Name"
            value={createName}
            onChange={(e) => setCreateName(e.target.value)}
            required
            style={styles.input}
          />
          <textarea
            placeholder="Description"
            value={createDescription}
            onChange={(e) => setCreateDescription(e.target.value)}
            required
            style={styles.textarea}
          />
          <input type="file" multiple onChange={handleCreateFileChange} style={styles.input} />
          <button type="submit" style={styles.button}>
            Create
          </button>
        </form>
        {createResponse && (
          <div style={createResponse.error ? styles.error : styles.success}>
            {createResponse.error ? `Error: ${createResponse.message}` : 'Resource created successfully!'}
          </div>
        )}
      </section>

      {/* Update Existing Resource */}
      <section style={styles.section}>
        <h2>Update Existing Resource</h2>
        <div style={styles.formGroup}>
          <input
            type="text"
            placeholder="Resource ID"
            value={updateId}
            onChange={(e) => setUpdateId(e.target.value)}
            style={styles.input}
          />
          <button onClick={() => {}} style={styles.button} disabled>
            Fetch Resource
          </button>
        </div>
        {updateId && (
          <form onSubmit={handleUpdateSubmit} style={styles.form}>
            <input
              type="text"
              placeholder="Name"
              value={updateName}
              onChange={(e) => setUpdateName(e.target.value)}
              required
              style={styles.input}
            />
            <textarea
              placeholder="Description"
              value={updateDescription}
              onChange={(e) => setUpdateDescription(e.target.value)}
              required
              style={styles.textarea}
            />
            <h3>Existing Media</h3>
            <div style={styles.mediaList}>
              {existingMedias.length === 0 && <p>No existing media.</p>}
              {existingMedias.map((media) => (
                <div key={media.objectKey} style={styles.mediaItem}>
                  <img
                    src={constructMediaURL(media.objectKey)}
                    alt="Media"
                    style={styles.mediaImage}
                  />
                  <label>
                    <input
                      type="checkbox"
                      checked={mediasToDelete.includes(media.objectKey)}
                      onChange={() => toggleMediaDeletion(media.objectKey)}
                    />
                    Delete
                  </label>
                </div>
              ))}
            </div>
            <h3>Add New Media</h3>
            <input type="file" multiple onChange={handleNewFileChange} style={styles.input} />
            <button type="submit" style={styles.button}>
              Update
            </button>
          </form>
        )}
        {updateResponse && (
          <div style={updateResponse.error ? styles.error : styles.success}>
            {updateResponse.error ? `Error: ${updateResponse.message}` : 'Resource updated successfully!'}
          </div>
        )}
      </section>
    </div>
  );
};

// Simple inline styles for demonstration purposes
const styles = {
  container: {
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
  },
  section: {
    marginBottom: '40px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '400px',
  },
  formGroup: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '20px',
  },
  input: {
    padding: '10px',
    marginBottom: '10px',
    fontSize: '16px',
  },
  textarea: {
    padding: '10px',
    marginBottom: '10px',
    fontSize: '16px',
    height: '80px',
  },
  button: {
    padding: '10px',
    fontSize: '16px',
    cursor: 'pointer',
    marginTop: '10px',
  },
  success: {
    color: 'green',
    marginTop: '10px',
  },
  error: {
    color: 'red',
    marginTop: '10px',
  },
  mediaList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
  },
  mediaItem: {
    position: 'relative',
    width: '100px',
    textAlign: 'center',
  },
  mediaImage: {
    width: '100px',
    height: '100px',
    objectFit: 'cover',
    borderRadius: '4px',
  },
};

export default TestMedia;
