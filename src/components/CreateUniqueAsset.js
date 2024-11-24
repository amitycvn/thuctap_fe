import React, { useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS

const CreateUniqueAsset = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [attributes, setAttributes] = useState([{ traitType: "", value: "" }]);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const handleAttributeChange = (index, event) => {
    const newAttributes = [...attributes];
    newAttributes[index][event.target.name] = event.target.value;
    setAttributes(newAttributes);
  };

  const addAttribute = () => {
    setAttributes([...attributes, { traitType: "", value: "" }]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const options = {
      method: "POST",
      url: "https://api.gameshift.dev/nx/unique-assets",
      headers: {
        accept: "application/json",
        "x-api-key":
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXkiOiI5ZDE3NDg3MS01MDdjLTQyYWEtODU5ZS1kMmFiNDRjY2U5ZDEiLCJzdWIiOiI4OGQzOGNiNi1hOTI1LTRlMDQtYWExMC1mZTJmMDBhYWQ4YzIiLCJpYXQiOjE3MzE0Nzk0NjN9.1yYN2JyuD9SIiCPp1aaPa8MXtqZlJEAyiQ6Q8oA8Zic", // Thay YOUR_API_KEY_HERE bằng API key thực tế của bạn
        "content-type": "application/json",
      },
      data: {
        details: {
          attributes: [{ traitType: "level", value: "high" }],
          collectionId: "4eda06ed-b497-4941-af90-ceae9c655aee", // Giá trị cố định
          description: description,
          imageUrl: imageUrl,
          name: name,
          price: {
            currencyId: "USDC",
            naturalAmount: "2.00",
          },
        },
        destinationUserReferenceId:
          "A7JW7U72LNKU3mKk3WgYrUdtC7fdF3vrrgVXesdjqr7e", // Giá trị cố định ví của shop
      },
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
        <button
          type="button"
          className="btn btn-secondary mt-3"
          onClick={addAttribute}
        >
          Add Another Attribute
        </button>
        <button type="submit" className="btn btn-primary mt-3">
          Submit
        </button>
      </form>
      {response && (
        <pre className="mt-3">
          Response: {JSON.stringify(response, null, 2)}
        </pre>
      )}
      {error && (
        <pre className="mt-3 text-danger">
          Error: {JSON.stringify(error, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default CreateUniqueAsset;
