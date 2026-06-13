import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  Plus,
  X,
  File,
  FileText,
  Presentation,
  Link as LinkIcon,
  Play,
  StickyNote,
  Download,
  Edit2,
  Trash2,
  Search,
  User,
} from "lucide-react";
import { circleService } from "../../services/circleService";

const RESOURCE_TYPES = {
  pdf: { label: "PDF Document", icon: File, color: "text-red-600" },
  doc: { label: "DOC/DOCX", icon: FileText, color: "text-blue-600" },
  ppt: { label: "PowerPoint", icon: Presentation, color: "text-orange-600" },
  link: { label: "External Link", icon: LinkIcon, color: "text-green-600" },
  youtube: { label: "YouTube Video", icon: Play, color: "text-red-500" },
  notes: { label: "Notes / Text", icon: StickyNote, color: "text-yellow-600" },
};

export default function ResourcesTab({ circle, user }) {
  const [resources, setResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingResource, setEditingResource] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    resource_type: "pdf",
    file: null,
    external_url: "",
  });

  const [editFormData, setEditFormData] = useState({
    title: "",
    description: "",
    external_url: "",
  });

  const canUploadResources = circle.is_creator || circle.is_mentor;

  const fetchResources = async () => {
    setLoading(true);
    try {
      const data = await circleService.getResources(circle.id);
      console.log("Resources API response:", data);
      
      // Handle DRF paginated response
      const resourcesList = data.results || [];
      
      console.log("Parsed resources list:", resourcesList);
      setResources(resourcesList);
      applyFilters(resourcesList);
    } catch (error) {
      console.error("Failed to load resources:", error);
      toast.error("Failed to load resources");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (resourcesList) => {
    let filtered = resourcesList;

    // Filter by type
    if (selectedFilter !== "all") {
      filtered = filtered.filter((r) => r.resource_type === selectedFilter);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.title.toLowerCase().includes(term) ||
          r.description.toLowerCase().includes(term) ||
          r.uploaded_by.username.toLowerCase().includes(term)
      );
    }

    setFilteredResources(filtered);
  };

  useEffect(() => {
    fetchResources();
  }, [circle.id]);

  useEffect(() => {
    applyFilters(resources);
  }, [selectedFilter, searchTerm]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({
      ...prev,
      file: file,
    }));
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }

    if (!formData.resource_type) {
      toast.error("Resource type is required");
      return;
    }

    // Validate file/URL requirement
    if (["pdf", "doc", "ppt"].includes(formData.resource_type) && !formData.file) {
      toast.error(`${formData.resource_type.toUpperCase()} resources require a file upload`);
      return;
    }

    if (["link", "youtube"].includes(formData.resource_type) && !formData.external_url) {
      toast.error("External links require a URL");
      return;
    }

    if (formData.resource_type === "notes" && !formData.description.trim()) {
      toast.error("Notes require a description");
      return;
    }

    try {
      // Build FormData for file upload
      const uploadData = new FormData();
      uploadData.append("title", formData.title);
      uploadData.append("description", formData.description);
      uploadData.append("resource_type", formData.resource_type);

      if (formData.file) {
        uploadData.append("file", formData.file);
      }
      if (formData.external_url) {
        uploadData.append("external_url", formData.external_url);
      }

      const response = await circleService.createResource(circle.id, uploadData);
      toast.success("Resource uploaded successfully!");
      setFormData({
        title: "",
        description: "",
        resource_type: "pdf",
        file: null,
        external_url: "",
      });
      setShowUploadModal(false);
      fetchResources();
    } catch (error) {
      console.error("Upload failed:", error);
      console.error("Error response:", error?.response?.data);
      
      // Handle validation errors
      if (error?.response?.data) {
        const errorData = error.response.data;
        if (errorData.file) {
          toast.error(errorData.file);
        } else if (errorData.external_url) {
          toast.error(errorData.external_url);
        } else if (errorData.description) {
          toast.error(errorData.description);
        } else if (errorData.title) {
          toast.error(errorData.title);
        } else if (errorData.error) {
          toast.error(errorData.error);
        } else {
          toast.error("Failed to upload resource. Please check all fields.");
        }
      } else {
        toast.error("Failed to upload resource");
      }
    }
  };

  const handleDeleteResource = async (resourceId) => {
    if (window.confirm("Are you sure you want to delete this resource?")) {
      try {
        await circleService.deleteResource(resourceId);
        toast.success("Resource deleted successfully!");
        fetchResources();
      } catch (error) {
        toast.error(error?.response?.data?.error || "Failed to delete resource");
      }
    }
  };

  const handleEditClick = (resource) => {
    setEditingResource(resource);
    setEditFormData({
      title: resource.title,
      description: resource.description,
      external_url: resource.external_url,
    });
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await circleService.updateResource(editingResource.id, editFormData);
      toast.success("Resource updated successfully!");
      setShowEditModal(false);
      setEditingResource(null);
      fetchResources();
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to update resource");
    }
  };

  const getResourceIcon = (resourceType) => {
    const info = RESOURCE_TYPES[resourceType];
    const Icon = info?.icon || File;
    return <Icon className={`w-8 h-8 ${info?.color || "text-gray-600"}`} />;
  };

  const getResourceTypeLabel = (resourceType) => {
    return RESOURCE_TYPES[resourceType]?.label || resourceType;
  };

  const handleOpenResource = (resource) => {
    if (resource.file_url) {
      window.open(resource.file_url, "_blank");
    } else if (resource.external_url) {
      window.open(resource.external_url, "_blank");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-textsecondary">Loading resources...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Upload Button */}
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-navy">Learning Resources</h2>
        {canUploadResources && (
          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-royal text-white px-4 py-2 rounded-xl font-semibold flex items-center gap-2 hover:bg-darkblue transition-all"
          >
            <Plus size={18} />
            Upload Resource
          </button>
        )}
      </div>

      {/* Search and Filters */}
      {resources.length > 0 && (
        <div className="space-y-4">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textsecondary" size={18} />
            <input
              type="text"
              placeholder="Search resources by title, description, or uploader..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-borderline focus:outline-none focus:ring-2 focus:ring-royal"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedFilter("all")}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                selectedFilter === "all"
                  ? "bg-royal text-white"
                  : "bg-white text-navy border border-borderline hover:bg-softblue"
              }`}
            >
              All
            </button>
            {Object.entries(RESOURCE_TYPES).map(([key, value]) => (
              <button
                key={key}
                onClick={() => setSelectedFilter(key)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                  selectedFilter === key
                    ? "bg-royal text-white"
                    : "bg-white text-navy border border-borderline hover:bg-softblue"
                }`}
              >
                <value.icon size={16} />
                {value.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Resources Grid */}
      {filteredResources.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredResources.map((resource) => (
            <div
              key={resource.id}
              className="rounded-2xl border border-borderline bg-white p-6 shadow-soft hover:shadow-glow transition-all"
            >
              {/* Resource Icon and Type */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getResourceIcon(resource.resource_type)}
                  <span className="text-xs font-semibold text-textsecondary">
                    {getResourceTypeLabel(resource.resource_type)}
                  </span>
                </div>
                {(resource.can_edit || resource.can_delete) && (
                  <div className="flex gap-1">
                    {resource.can_edit && (
                      <button
                        onClick={() => handleEditClick(resource)}
                        className="p-2 hover:bg-appbg rounded-lg text-textsecondary hover:text-royal transition-all"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                    )}
                    {resource.can_delete && (
                      <button
                        onClick={() => handleDeleteResource(resource.id)}
                        className="p-2 hover:bg-appbg rounded-lg text-textsecondary hover:text-red-600 transition-all"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Title */}
              <h3 className="font-bold text-navy mb-2 line-clamp-2">{resource.title}</h3>

              {/* Description */}
              {resource.description && (
                <p className="text-sm text-textsecondary mb-3 line-clamp-2">{resource.description}</p>
              )}

              {/* Uploader Info */}
              <div className="flex items-center gap-2 mb-4 py-3 border-t border-b border-borderline">
                <div className="w-8 h-8 rounded-full bg-softblue flex items-center justify-center flex-shrink-0">
                  <User size={14} className="text-royal" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-navy truncate">
                    {resource.uploaded_by.first_name || resource.uploaded_by.username}
                  </p>
                  <p className="text-xs text-textsecondary">
                    {new Date(resource.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Open/Download Button */}
              <button
                onClick={() => handleOpenResource(resource)}
                className="w-full bg-royal text-white px-4 py-2 rounded-lg font-semibold hover:bg-darkblue transition-all flex items-center justify-center gap-2"
              >
                {resource.file_url || resource.external_url ? (
                  <>
                    {resource.file_url ? <Download size={16} /> : <LinkIcon size={16} />}
                    {resource.file_url ? "Download" : "Open"}
                  </>
                ) : (
                  "View"
                )}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 rounded-2xl bg-appbg">
          <StickyNote className="w-12 h-12 mx-auto mb-4 text-textsecondary" />
          <h3 className="font-semibold text-navy mb-2">
            {searchTerm || selectedFilter !== "all" ? "No resources found" : "No resources shared yet"}
          </h3>
          <p className="text-textsecondary mb-4">
            {searchTerm || selectedFilter !== "all"
              ? "Try adjusting your search or filters"
              : "Mentors and owners can upload learning materials for this circle."}
          </p>
          {canUploadResources && !searchTerm && selectedFilter === "all" && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-royal text-white px-6 py-2 rounded-xl font-semibold hover:bg-darkblue transition-all inline-flex items-center gap-2"
            >
              <Plus size={18} />
              Upload First Resource
            </button>
          )}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-navy">Upload Resource</h3>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setFormData({
                    title: "",
                    description: "",
                    resource_type: "pdf",
                    file: null,
                    external_url: "",
                  });
                }}
                className="text-textsecondary hover:text-navy"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-navy mb-2">
                  Title <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Python Basics Tutorial"
                  className="w-full px-4 py-3 rounded-xl border border-borderline focus:outline-none focus:ring-2 focus:ring-royal"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-navy mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe what this resource is about..."
                  rows="3"
                  className="w-full px-4 py-3 rounded-xl border border-borderline focus:outline-none focus:ring-2 focus:ring-royal"
                />
              </div>

              {/* Resource Type */}
              <div>
                <label className="block text-sm font-semibold text-navy mb-2">
                  Resource Type <span className="text-red-600">*</span>
                </label>
                <select
                  name="resource_type"
                  value={formData.resource_type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-borderline focus:outline-none focus:ring-2 focus:ring-royal"
                >
                  {Object.entries(RESOURCE_TYPES).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* File Upload (for PDF, DOC, PPT) */}
              {["pdf", "doc", "ppt"].includes(formData.resource_type) && (
                <div>
                  <label className="block text-sm font-semibold text-navy mb-2">
                    Upload File <span className="text-red-600">*</span>
                  </label>
                  <div className="border-2 border-dashed border-borderline rounded-xl p-4 text-center hover:bg-appbg transition-all cursor-pointer">
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept={
                        formData.resource_type === "pdf"
                          ? ".pdf"
                          : formData.resource_type === "doc"
                          ? ".doc,.docx"
                          : ".ppt,.pptx"
                      }
                      className="hidden"
                      id="fileInput"
                    />
                    <label htmlFor="fileInput" className="cursor-pointer">
                      {formData.file ? (
                        <>
                          <File className="w-6 h-6 mx-auto mb-2 text-royal" />
                          <p className="text-sm font-semibold text-navy">{formData.file.name}</p>
                          <p className="text-xs text-textsecondary">Click to change</p>
                        </>
                      ) : (
                        <>
                          <File className="w-6 h-6 mx-auto mb-2 text-textsecondary" />
                          <p className="text-sm font-semibold text-navy">Click to upload or drag and drop</p>
                          <p className="text-xs text-textsecondary">
                            {formData.resource_type === "pdf"
                              ? "PDF files only"
                              : formData.resource_type === "doc"
                              ? "DOC, DOCX files only"
                              : "PPT, PPTX files only"}
                          </p>
                        </>
                      )}
                    </label>
                  </div>
                </div>
              )}

              {/* External URL (for links, YouTube) */}
              {["link", "youtube"].includes(formData.resource_type) && (
                <div>
                  <label className="block text-sm font-semibold text-navy mb-2">
                    URL <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="url"
                    name="external_url"
                    value={formData.external_url}
                    onChange={handleInputChange}
                    placeholder={
                      formData.resource_type === "youtube"
                        ? "e.g., https://www.youtube.com/watch?v=..."
                        : "e.g., https://example.com"
                    }
                    className="w-full px-4 py-3 rounded-xl border border-borderline focus:outline-none focus:ring-2 focus:ring-royal"
                    required={["link", "youtube"].includes(formData.resource_type)}
                  />
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadModal(false);
                    setFormData({
                      title: "",
                      description: "",
                      resource_type: "pdf",
                      file: null,
                      external_url: "",
                    });
                  }}
                  className="flex-1 border border-borderline text-navy px-6 py-3 rounded-xl font-semibold hover:bg-appbg transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-royal text-white px-6 py-3 rounded-xl font-semibold hover:bg-darkblue transition-all"
                >
                  Upload Resource
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingResource && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-navy">Edit Resource</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingResource(null);
                }}
                className="text-textsecondary hover:text-navy"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-navy mb-2">Title</label>
                <input
                  type="text"
                  name="title"
                  value={editFormData.title}
                  onChange={handleEditChange}
                  className="w-full px-4 py-3 rounded-xl border border-borderline focus:outline-none focus:ring-2 focus:ring-royal"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-navy mb-2">Description</label>
                <textarea
                  name="description"
                  value={editFormData.description}
                  onChange={handleEditChange}
                  rows="3"
                  className="w-full px-4 py-3 rounded-xl border border-borderline focus:outline-none focus:ring-2 focus:ring-royal"
                />
              </div>

              {/* External URL (if applicable) */}
              {["link", "youtube"].includes(editingResource.resource_type) && (
                <div>
                  <label className="block text-sm font-semibold text-navy mb-2">URL</label>
                  <input
                    type="url"
                    name="external_url"
                    value={editFormData.external_url}
                    onChange={handleEditChange}
                    className="w-full px-4 py-3 rounded-xl border border-borderline focus:outline-none focus:ring-2 focus:ring-royal"
                  />
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingResource(null);
                  }}
                  className="flex-1 border border-borderline text-navy px-6 py-3 rounded-xl font-semibold hover:bg-appbg transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-royal text-white px-6 py-3 rounded-xl font-semibold hover:bg-darkblue transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
