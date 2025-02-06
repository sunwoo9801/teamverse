import React, { useState } from "react";
import Navbar from "../components/Navbar";
import "../styles/TeamStatusPage.css";

const teamMembers = [
  {
    id: 1,
    name: "Naomi Yepes",
    role: "Apple",
    location: "Sofia",
    timezone: "PST",
    status: "In the flow",
    avatar: "/avatars/naomi.png",
    company: "Apple",
    email: "naomi@apple.com",
    phone: "+1 678 123 908",
  },
  {
    id: 2,
    name: "Matilda Evans",
    role: "Apple",
    location: "Quezon City",
    timezone: "PST",
    status: "In the flow",
    avatar: "/avatars/matilda.png",
    company: "Apple",
    email: "matilda@apple.com",
    phone: "+1 678 234 567",
  },
  {
    id: 3,
    name: "Darika Samak",
    role: "Apple",
    location: "Bangalore",
    timezone: "PST",
    status: "Offline",
    avatar: "/avatars/darika.png",
    company: "Apple",
    email: "darika@apple.com",
    phone: "+1 678 123 908",
  },
];

const TeamStatusPage = () => {
  const [selectedMember, setSelectedMember] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleMemberClick = (member) => {
    setSelectedMember(member);
  };

  const closeProfile = () => {
    setSelectedMember(null);
  };

  const filteredMembers = teamMembers.filter((member) =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="team-status-page">

      <div className="content">
        <h1>Teams</h1>

        {/* 검색 및 필터 */}
        <div className="search-filter">
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="invite-button">Invite Member</button>
        </div>

        {/* 팀원 리스트 */}
        <div className="team-list">
          <table>
            <thead>
              <tr>
                <th>Status</th>
                <th>Name</th>
                <th>Company</th>
                <th>Location</th>
                <th>Timezone</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => (
                <tr key={member.id} onClick={() => handleMemberClick(member)}>
                  <td>
                    <span
                      className={`status-indicator ${
                        member.status === "In the flow" ? "online" : "offline"
                      }`}
                    ></span>
                  </td>
                  <td>{member.name}</td>
                  <td>{member.company}</td>
                  <td>{member.location}</td>
                  <td>{member.timezone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 프로필 상세 패널 */}
      {selectedMember && (
        <div className="profile-panel">
          <button className="close-btn" onClick={closeProfile}>
            &times;
          </button>
          <div className="profile-content">
            <img src={selectedMember.avatar} alt={selectedMember.name} />
            <h2>{selectedMember.name}</h2>
            <p>{selectedMember.location}</p>
            <p><strong>Company:</strong> {selectedMember.company}</p>
            <p><strong>Status:</strong> {selectedMember.status}</p>
            <p><strong>Email:</strong> {selectedMember.email}</p>
            <p><strong>Phone:</strong> {selectedMember.phone}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamStatusPage;
