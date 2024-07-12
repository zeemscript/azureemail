"use client";
import { useState } from "react";
import { EmailClient, KnownEmailSendStatus } from "@azure/communication-email";
import { AzureKeyCredential } from "@azure/core-auth";

const Home = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const endpoint = process.env.NEXT_PUBLIC_COMMUNICATION_SERVICES_ENDPOINT;
    const apiKey = process.env.NEXT_PUBLIC_COMMUNICATION_SERVICES_API_KEY;

    if (!endpoint || !apiKey) {
      setError("Endpoint or API key is missing.");
      setLoading(false);
      return;
    }

    const emailClient = new EmailClient(
      endpoint,
      new AzureKeyCredential(apiKey)
    );

    const message = {
      senderAddress: "donotreply@walkmetru.com",
      content: {
        subject: "Test of Azure Communication Services Email",
        plainText:
          "This email message is sent from Abdulhazeem using the TypeScript SDK.",
      },
      recipients: {
        to: [
          {
            address: email,
          },
        ],
      },
    };

    try {
      const poller = await emailClient.beginSend(message);

      if (!poller.getOperationState()?.isStarted) {
        throw new Error("Poller was not started.");
      }

      let timeElapsed = 0;
      while (!poller.isDone()) {
        poller.poll();
        console.log("Email send polling in progress");

        await new Promise((resolve) => setTimeout(resolve, 10000)); // Adjust as needed
        timeElapsed += 10;

        if (timeElapsed > 180) {
          throw new Error("Polling timed out.");
        }
      }

      const result = poller.getResult();
      if (result?.status === KnownEmailSendStatus.Succeeded) {
        setStatus(`Successfully sent the email (operation id: ${result.id})`);
        setEmail(""); // Clear input field after successful submission
      } else {
        throw new Error(result?.error?.message || "Unknown error occurred.");
      }
    } catch (err: Error) {
      setError(err.message || "Failed to send email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-4">Send Email Form</h1>
        <form onSubmit={handleSubmit} className="flex flex-col items-center">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border border-gray-300 px-3 py-2 text-black rounded-md mb-2 placeholder-black"
          />
          <button
            type="submit"
            className={`bg-blue-500 text-white px-4 py-2 rounded-md ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            {loading && (
              <svg
                className="animate-spin h-5 w-5 mr-3 text-white"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A8.002 8.002 0 0112 4.472v3.78l4.738 2.84-1.789 2.983L10 10.169v7.122z"
                />
              </svg>
            )}
            Send Email
          </button>
        </form>
        {status && <p className="text-green-600 mt-2">{status}</p>}
        {error && <p className="text-red-600 mt-2">{error}</p>}
      </div>

      {/* Your existing content below */}
      {/* ... */}
    </main>
  );
};

export default Home;
