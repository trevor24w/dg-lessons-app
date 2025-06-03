import React from 'react';

export default function Sidebar({
  search,
  onSearch,
  durations,
  selectedDurations,
  onDurationChange,
  channels,
  selectedChannels,
  onChannelChange
}) {
  return (
    <aside className="sidebar">
      <div className="sidebar-section">
        <label className="sidebar-label">Search videos</label>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={e => onSearch(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>
      </div>
      <div className="sidebar-section">
        <label className="sidebar-label">Duration</label>
        <div className="checkbox-group">
          {durations.map(dur => (
            <label key={dur.value} className="checkbox-label">
              <input
                type="checkbox"
                checked={selectedDurations.includes(dur.value)}
                onChange={() => onDurationChange(dur.value)}
              />
              {dur.label}
            </label>
          ))}
        </div>
      </div>
      <div className="sidebar-section">
        <label className="sidebar-label">Channels</label>
        <div className="checkbox-group">
          {channels.map(channel => (
            <label key={channel} className="checkbox-label">
              <input
                type="checkbox"
                checked={selectedChannels.includes(channel)}
                onChange={() => onChannelChange(channel)}
              />
              {channel}
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
} 