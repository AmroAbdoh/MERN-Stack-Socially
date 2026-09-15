import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import PrimaryButton from "../../components/Button/Button";
import "./profile.css";

function Profile() {
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName") || "User";
  const userRole = localStorage.getItem("userRole") || "user";
  const userEmail = localStorage.getItem("userEmail") || "user@example.com";

  const handleChangePassword = () => {
    navigate("/forgot-password");
  };

  return (
    <>
      <Navbar />
      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-icon-wrapper">
            <svg
              viewBox="0 0 24 24"
              className="profile-icon"
              aria-hidden="true"
            >
              <path d="M12 12a4 4 0 100-8 4 4 0 000 8zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5z" />
            </svg>
          </div>

          <div className="profile-info">
            <h1 className="profile-name">{userName}</h1>
            <p className="profile-email">{userEmail}</p>
            
          </div>

          <div className="profile-actions">
            <PrimaryButton
              label="Reset password"
              type="button"
              variant="secondary"
              onClick={handleChangePassword}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default Profile;
