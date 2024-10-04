import React, { useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS

const CreateUniqueAsset = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [attributes, setAttributes] = useState([{ traitType: '', value: '' }]);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const handleAttributeChange = (index, event) => {
    const newAttributes = [...attributes];
    newAttributes[index][event.target.name] = event.target.value;
    setAttributes(newAttributes);
  };

  const addAttribute = () => {
    setAttributes([...attributes, { traitType: '', value: '' }]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    const options = {
      method: 'POST',
      url: 'https://api.gameshift.dev/nx/unique-assets',
      headers: {
        accept: 'application/json',
        'x-api-key': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXkiOiJmYzAxNjMzZS0yNzFhLTQ2ZGEtOGUyZC1lYjVjNTAxODcyNzMiLCJzdWIiOiIxMWE4ODUxZC03ZWViLTQyNjktYTMzOS05MGZiNzAyZjFjYzMiLCJpYXQiOjE3MjE2MzM5MDB9.LRGC8FSwaSogOSbZ50Fnjw_v1Y7T_BcSJCVuG08Inqc', // Thay YOUR_API_KEY_HERE bằng API key thực tế của bạn
        'content-type': 'application/json'
      },
      data: {
        details: {
          //attributes: attributes,
          collectionId: '6cfdd0b2-9e0c-43ce-8311-eb0f622f330f', // Giá trị cố định
          description: description,
          imageUrl: imageUrl,
          name: name,
          price: 3
        },
        destinationUserReferenceId: '1', // Giá trị cố định
      }
    };

    try {
      const response = await axios.request(options);
      setResponse(response.data);
      setError(null);
    } catch (error) {
      setResponse(null);
      setError(error.response ? error.response.data : error.message);
    }
  };

  return (
    <div className="container mt-4">
      <h1>Create Unique Asset</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="form-group mt-3">
          <label htmlFor="description">Description:</label>
          <input
            type="text"
            id="description"
            className="form-control"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <div className="form-group mt-3">
          <label htmlFor="imageUrl">Image URL:</label>
          <input
            type="text"
            id="imageUrl"
            className="form-control"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            required
          />
        </div>
        {/* {attributes.map((attr, index) => (
          <div className="form-group mt-3" key={index}>
            <label htmlFor={`traitType-${index}`}>Attribute {index + 1} Trait Type:</label>
            <input
              type="text"
              id={`traitType-${index}`}
              name="traitType"
              className="form-control"
              value={attr.traitType}
              onChange={(e) => handleAttributeChange(index, e)}
              placeholder="Trait Type"
              required
            />
            <label htmlFor={`value-${index}`} className="mt-2">Attribute {index + 1} Value:</label>
            <input
              type="text"
              id={`value-${index}`}
              name="value"
              className="form-control"
              value={attr.value}
              onChange={(e) => handleAttributeChange(index, e)}
              placeholder="Value"
              required
            />
          </div>
        ))} */}
        <button type="button" className="btn btn-secondary mt-3" onClick={addAttribute}>
          Add Another Attribute
        </button>
        <button type="submit" className="btn btn-primary mt-3">
          Submit
        </button>
      </form>
      {response && <pre className="mt-3">Response: {JSON.stringify(response, null, 2)}</pre>}
      {error && <pre className="mt-3 text-danger">Error: {JSON.stringify(error, null, 2)}</pre>}
    </div>
  );
};

export default CreateUniqueAsset;
