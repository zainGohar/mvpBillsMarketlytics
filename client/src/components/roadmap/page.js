"use client";
import React from "react";
import { config } from "../../../config";

const Roadmap = () => {
  return (
    <>
      <div className="timeline">
        {config.roadmap?.map((r, i) => {
          let index = (i % 3) + 1;
          return (
            <div
              className={`timeline-event animated fadeInUp timeline-event--type${index}`}
            >
              <div className="timeline-event-icon ">
                <i className={`bi bi-${r.icon}`} />
              </div>
              <div className="timeline-event-date">{r.date}</div>
              <div className="timeline-event-content ">
                <div className="timeline-event-title">{r.title}</div>
                <div className="timeline-event-description">
                  <p>{r.content}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default Roadmap;
