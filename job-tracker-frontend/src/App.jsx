import { useState, useEffect } from "react";
import {
  Container,
  Form,
  Button,
  Row,
  Col,
  Alert,
} from "react-bootstrap";
import bounce from '../bounce.gif';
import sleepyku from '../Untitled_Artwork.png';

function JobForm() {
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jobUrl, setJobUrl] = useState(() => {
    return sessionStorage.getItem("jobUrl") || "";
  });
  const [dateApplied, setDateApplied] = useState("");
  const [status, setStatus] = useState("");
  const [isOn, setIsOn] = useState(false);

  const handleClick = () => {
    setIsOn(prev => !prev);
  };

  // ✅ Auto-fill dateApplied with the first day of the current month
  useEffect(() => {
    const firstDay = new Date();
    const formatted = firstDay.toISOString().split("T")[0];
    setDateApplied(formatted);
  }, []);

  // ✅ Auto-fetch job title and company when job URL changes
  useEffect(() => {
    if (!jobUrl) return;

    const fetchJobTitle = async () => {
      setJobTitle("Fetching title...");
      setCompany("Fetching company...")

      try {
        const res = await fetch(
          `http://localhost:3000/get-job-title?url=${encodeURIComponent(jobUrl)}`
        );
        const data = await res.json();

        if (data.title) {
          setJobTitle(data.title);
        } else {
          setJobTitle("Unknown title");
        }
      } catch (err) {
        console.error("❌ Failed to fetch job title:", err);
        setJobTitle("Failed to fetch");
      }

      try {
        const res = await fetch(
          `http://localhost:3000/get-company?url=${encodeURIComponent(jobUrl)}`
        );
        const data = await res.json();

        if (data.company) {
          setCompany(data.company);
        } else {
          setCompany("Unknown company");
        }
      } catch (err) {
        console.error("❌ Failed to fetch job company:", err);
        setCompany("Failed to fetch");
      }

    };

    fetchJobTitle();
  }, [jobUrl]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:3000/add-job", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ jobTitle, jobUrl, company, dateApplied }),
      });

      const data = await res.json();
      if (res.ok) {
        setStatus("✅ Job saved!");
        setJobTitle("");
        setJobUrl("");
        sessionStorage.removeItem("jobUrl"); // ✅ clear on successful submit

        // Reset date to first of the month again after submit
        const today = new Date();
        const formatted = today.toISOString().split("T")[0];
        setDateApplied(formatted);

        // Clear status after 3 seconds
        setTimeout(() => setStatus(""), 3000);
      } else {
        setStatus("❌ Error: " + (data.error || "Could not save"));

        // Clear error after 5 seconds (optional)
        setTimeout(() => setStatus(""), 5000);
      }
    } catch (err) {
      setStatus("❌ Network error");

      // Clear network error after 5 seconds (optional)
      setTimeout(() => setStatus(""), 5000);
    }
  };


  return (
    <Container className="my-5">
      <img src={sleepyku} alt="Artwork" style={{ width: "450px", height: "auto" }} />

      <h3 className="mb-4 text-center">Save Applied Jobs</h3>

      <Form onSubmit={handleSubmit}>
        <Form.Group as={Row} className="mb-3" controlId="formJobUrl">
          <Form.Label column sm={3} style={{ fontWeight: "bold" }}>Job URL</Form.Label>
          <Col sm={9}>
            <Form.Control
              type="url"
              placeholder="e.g. https://careers.example.com/job123"
              value={jobUrl}
              onChange={(e) => {
                setJobUrl(e.target.value);
                sessionStorage.setItem("jobUrl", e.target.value); // ✅ store in session
              }}
              style={{ fontWeight: "bold" }}
              required
            />
          </Col>
        </Form.Group>

        <Form.Group as={Row} className="mb-3" controlId="formJobTitle">
          <Form.Label column sm={3}>Job Title</Form.Label>
          <Col sm={9}>
            <Form.Control
              type="text"
              placeholder="e.g. Software Engineer"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              required
            />
          </Col>
        </Form.Group>

        <Form.Group as={Row} className="mb-3" controlId="formJobTitle">
          <Form.Label column sm={3}>Company</Form.Label>
          <Col sm={9}>
            <Form.Control
              type="text"
              placeholder="e.g. Google"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              required
            />
          </Col>
        </Form.Group>

        <Form.Group as={Row} className="mb-4" controlId="formDateApplied">
          <Form.Label column sm={3}>Date Applied</Form.Label>
          <Col sm={9}>
            <Form.Control
              type="date"
              value={dateApplied}
              onChange={(e) => setDateApplied(e.target.value)}
            />
          </Col>
        </Form.Group>

        <button onClick={handleClick} style={{
          padding: '10px',
          backgroundColor: isOn ? 'limegreen' : 'lightgray',
          color: 'white',
          border: 'none',
          borderRadius: '20px',
          cursor: 'pointer',
          marginBottom: '20px'
        }}>
          {isOn ? 'ON' : 'OFF'}
        </button>

        <div className="text-center">
          <Button variant="primary" type="submit">
            Submit Application
          </Button>
        </div>

        {status && (
          <Alert variant="info" className="mt-4 text-center">
            {status}
          </Alert>
        )}
      </Form>
    </Container>
  );
}

export default JobForm;
