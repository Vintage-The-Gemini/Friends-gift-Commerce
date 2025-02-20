import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ChevronLeft, Save, Trash2 } from "lucide-react";
import { eventService } from "../../services/api/event";
import ProductSelection from "../../components/events/ProductSelection";
import { formatCurrency } from "../../utils/currency";
import { toast } from "react-toastify";

const EditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    eventType: "",
    description: "",
    eventDate: "",
    endDate: "",
    visibility: "public",
    selectedProducts: [],
  });

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      const response = await eventService.getEvent(id);
      if (response.success) {
        const event = response.data;
        setFormData({
          title: event.title,
          eventType: event.eventType,
          description: event.description,
          eventDate: new Date(event.eventDate).toISOString().split("T")[0],
          endDate: new Date(event.endDate).toISOString().split("T")[0],
          visibility: event.visibility,
          selectedProducts: event.products.map((item) => ({
            product: item.product,
            quantity: item.quantity,
          })),
        });
      }
    } catch (error) {
      setError("Failed to load event details");
      toast.error("Failed to load event details");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      // Validate required fields
      if (!formData.title?.trim()) throw new Error("Event title is required");
      if (!formData.eventType) throw new Error("Event type is required");
      if (!formData.description?.trim())
        throw new Error("Description is required");
      if (!formData.eventDate) throw new Error("Event date is required");
      if (!formData.endDate) throw new Error("End date is required");
      if (!formData.selectedProducts?.length)
        throw new Error("Please select at least one product");

      // Format products data
      const formattedProducts = formData.selectedProducts.map((item) => ({
        product: item.product._id,
        quantity: parseInt(item.quantity) || 1,
      }));

      // Calculate target amount
      const targetAmount = formData.selectedProducts.reduce((total, item) => {
        return total + item.product.price * item.quantity;
      }, 0);

      const eventData = {
        title: formData.title.trim(),
        eventType: formData.eventType,
        description: formData.description.trim(),
        eventDate: formData.eventDate,
        endDate: formData.endDate,
        visibility: formData.visibility,
        targetAmount,
        products: JSON.stringify(formattedProducts),
      };

      const response = await eventService.updateEvent(id, eventData);

      if (response.success) {
        toast.success("Event updated successfully!");
        navigate(`/events/${id}`);
      } else {
        throw new Error(response.message || "Failed to update event");
      }
    } catch (error) {
      setError(error.message);
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }

    try {
      const response = await eventService.deleteEvent(id);
      if (response.success) {
        toast.success("Event deleted successfully");
        navigate("/events");
      } else {
        throw new Error(response.message || "Failed to delete event");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5551FF]"></div>
      </div>
    );
  }

  const eventTypes = [
    { value: "birthday", label: "Birthday" },
    { value: "wedding", label: "Wedding" },
    { value: "graduation", label: "Graduation" },
    { value: "babyShower", label: "Baby Shower" },
    { value: "houseWarming", label: "House Warming" },
    { value: "anniversary", label: "Anniversary" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Link
            to={`/events/${id}`}
            className="flex items-center text-gray-600 hover:text-gray-800"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back
          </Link>
          <h1 className="text-2xl font-bold ml-4">Edit Event</h1>
        </div>
        <button
          onClick={handleDelete}
          className={`px-4 py-2 rounded-lg flex items-center ${
            deleteConfirm
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "bg-gray-100 hover:bg-gray-200 text-gray-700"
          }`}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          {deleteConfirm ? "Confirm Delete" : "Delete Event"}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.eventType}
                onChange={(e) =>
                  setFormData({ ...formData, eventType: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#5551FF]"
                required
              >
                <option value="">Select Event Type</option>
                {eventTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#5551FF]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#5551FF]"
                rows="4"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.eventDate}
                  onChange={(e) =>
                    setFormData({ ...formData, eventDate: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#5551FF]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#5551FF]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Visibility
              </label>
              <select
                value={formData.visibility}
                onChange={(e) =>
                  setFormData({ ...formData, visibility: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#5551FF]"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="unlisted">Unlisted</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Select Products <span className="text-red-500">*</span>
              </label>
              <ProductSelection
                selectedProducts={formData.selectedProducts}
                onProductSelect={(products) =>
                  setFormData({ ...formData, selectedProducts: products })
                }
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Link
              to={`/events/${id}`}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="bg-[#5551FF] text-white px-6 py-2 rounded-lg hover:bg-[#4440FF] disabled:opacity-50 flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEvent;
