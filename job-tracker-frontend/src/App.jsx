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

function JobForm() {
  const [jobTitle, setJobTitle] = useState("");
  const [jobUrl, setJobUrl] = useState(() => {
    return sessionStorage.getItem("jobUrl") || "";
  });
  const [dateApplied, setDateApplied] = useState("");
  const [status, setStatus] = useState("");

  // ✅ Auto-fill dateApplied with the first day of the current month
  useEffect(() => {
    const firstDay = new Date();
    const formatted = firstDay.toISOString().split("T")[0];
    setDateApplied(formatted);
  }, []);

  // ✅ Auto-fetch job title when job URL changes
  useEffect(() => {
    if (!jobUrl) return;

    const fetchJobTitle = async () => {
      setJobTitle("Fetching title...");

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
        body: JSON.stringify({ jobTitle, jobUrl, dateApplied }),
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
      } else {
        setStatus("❌ Error: " + (data.error || "Could not save"));
      }
    } catch (err) {
      setStatus("❌ Network error");
    }
  };

  return (
    <Container className="my-5">
      <img src={bounce} alt="My Logo" />

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
