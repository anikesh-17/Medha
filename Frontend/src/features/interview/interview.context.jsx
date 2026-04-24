import { createContext, useState } from "react";

export const InterviewContext = createContext();

export const InterviewProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [reports, setReports] = useState([]);

  return (
    <InterviewContext.Provider
      value={{ loading, setLoading, isPdfLoading, setIsPdfLoading, report, setReport, reports, setReports }}
    >
      {children}
    </InterviewContext.Provider>
  );
};
