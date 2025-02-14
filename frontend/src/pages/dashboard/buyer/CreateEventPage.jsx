// src/pages/dashboard/buyer/CreateEventPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import CreateEventForm from "../../../components/events/CreateEventForm";

const CreateEventPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user) {
    navigate("/auth/signin");
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Create New Event</h1>
        <CreateEventForm />
      </div>
    </div>
  );
};

export default CreateEventPage;
