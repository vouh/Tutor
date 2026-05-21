import { Navigate, useParams } from "react-router-dom";

export default function Enroll() {
  const { id } = useParams();
  return <Navigate to={id ? `/course/${id}#apply` : "/courses"} replace />;
}
