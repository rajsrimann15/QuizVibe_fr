import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const NavigationGuard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "Are you sure you want to leave? Your progress will be lost.";
    };

    const handlePopState = () => {
      alert("Back/Forward navigation is disabled!");
      navigate(1); // Prevents going back
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [navigate]);

  return null;
};

export default NavigationGuard;
