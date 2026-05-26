import { useState } from "react";
import axios from "axios";
import { API } from "../../lib/api";
import { nameToSlug } from "../../lib/utils";

export function useSetupWizard() {
  const [wizard, setWizard] = useState({ step: 1, loading: false, error: null });
  const [build, setBuild] = useState({ userId: null, indexing: false, indexed: false });
  const [profile, setProfile] = useState({ name: "", title: "", bio: "" });
  const [photo, setPhoto] = useState(null);
  const [linkedinFile, setLinkedinFile] = useState(null);
  const [extraFiles, setExtraFiles] = useState([]);

  const portfolioUrl = build.userId
    ? `${window.location.origin}${window.location.pathname}#/portfolio/${nameToSlug(profile.name)}-${build.userId}`
    : "";

  const createProfile = async (selectedRepos, githubUsername) => {
    if (!profile.name) return setWizard(w => ({ ...w, error: "Name is required" }));
    setWizard(w => ({ ...w, loading: true, error: null }));
    try {
      const res = await axios.post(`${API}/setup/profile`, { name: profile.name, title: profile.title, bio: profile.bio, github_urls: selectedRepos, github_username: githubUsername });
      const uid = res.data.user_id;
      setBuild(b => ({ ...b, userId: uid }));
      if (photo) { const f = new FormData(); f.append("file", photo); await axios.post(`${API}/upload/photo/${uid}`, f); }
      setWizard(w => ({ ...w, step: 2 }));
    } catch { setWizard(w => ({ ...w, error: "Could not connect to the backend. Please try again." })); }
    finally { setWizard(w => ({ ...w, loading: false })); }
  };

  const uploadLinkedin = async () => {
    if (!linkedinFile) return setWizard(w => ({ ...w, step: 3 }));
    setWizard(w => ({ ...w, loading: true, error: "" }));
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const f = new FormData(); f.append("file", linkedinFile);
        await axios.post(`${API}/upload/linkedin/${build.userId}`, f, { timeout: 60000 });
        setWizard(w => ({ ...w, loading: false, step: 3 })); return;
      } catch (e) { if (attempt < 3) await new Promise(r => setTimeout(r, 1500 * attempt)); }
    }
    setWizard(w => ({ ...w, loading: false, error: "LinkedIn upload failed after 3 attempts. Please try again." }));
  };

  const uploadExtras = async () => {
    setWizard(w => ({ ...w, loading: true }));
    try {
      for (const file of extraFiles) { const f = new FormData(); f.append("file", file); await axios.post(`${API}/upload/document/${build.userId}`, f); }
      setWizard(w => ({ ...w, step: 4 }));
    } catch { setWizard(w => ({ ...w, error: "Document upload failed" })); }
    finally { setWizard(w => ({ ...w, loading: false })); }
  };

  const buildIndex = async () => {
    setBuild(b => ({ ...b, indexing: true })); setWizard(w => ({ ...w, error: null }));
    try { await axios.post(`${API}/index/${build.userId}`); setBuild(b => ({ ...b, indexed: true })); }
    catch (e) { setWizard(w => ({ ...w, error: e.response?.data?.detail || "Indexing failed" })); }
    finally { setBuild(b => ({ ...b, indexing: false })); }
  };

  return {
    wizard, setWizard, build, profile, setProfile,
    photo, setPhoto, linkedinFile, setLinkedinFile,
    extraFiles, setExtraFiles, portfolioUrl,
    createProfile, uploadLinkedin, uploadExtras, buildIndex,
  };
}
