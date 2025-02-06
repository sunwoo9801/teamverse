import React, { useState } from 'react';
import '../styles/ActivityFeed.css';

const ActivityFeed = ({ activities = [] }) => {
  return (
    <div className="activity-feed">
      <h3 className="feed-title">Activity Feed</h3>
      <ul className="activity-list">
        {activities.map((activity, index) => (
          <li key={index} className={`activity-item ${activity.important ? 'important' : ''}`}>
            <span className="activity-time">{activity.time}</span>
            <div className="activity-content">
              <span className="activity-message">{activity.message}</span>
              {activity.link && (
                <a href={activity.link} target="_blank" rel="noopener noreferrer" className="activity-link">
                  View Details
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ActivityFeed;
