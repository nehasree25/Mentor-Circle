import { API_BASE_URL } from "../../api/axios";

export default function Avatar({ user, size = "w-16 h-16" }) {
  const initials = user?.first_name?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || "?";
  const profilePicture = user?.profile?.profile_picture;

  // Filter out any rounded-* classes from the size prop
  const cleanedSize = size
    .split(" ")
    .filter(cls => !cls.startsWith("rounded-"))
    .join(" ");

  const getImageSrc = (pic) => {
    if (!pic) return null;
    if (pic.startsWith("http://") || pic.startsWith("https://")) {
      return pic;
    }
    const baseMediaUrl = API_BASE_URL.replace(/\/api$/, "");
    if (pic.startsWith("/")) {
      return `${baseMediaUrl}${pic}`;
    }
    return `${baseMediaUrl}/media/${pic}`;
  };

  const imageSrc = getImageSrc(profilePicture);

  const handleImageError = (e) => {
    e.target.style.display = 'none';
    const fallback = e.target.nextElementSibling;
    if (fallback) fallback.style.display = 'flex';
  };

  return (
    <div className={`${cleanedSize} rounded-full overflow-hidden bg-gray-200 flex items-center justify-center flex-shrink-0`}>
      {imageSrc ? (
        <>
          <img
            src={imageSrc}
            alt={`${user?.first_name || user?.username}'s avatar`}
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
          <div 
            className="w-full h-full bg-gradient-to-br from-royal to-darkblue flex items-center justify-center text-white font-bold text-xl hidden"
          >
            {initials}
          </div>
        </>
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-royal to-darkblue flex items-center justify-center text-white font-bold text-xl">
          {initials}
        </div>
      )}
    </div>
  );
}