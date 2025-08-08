// For now, redirect edit to create page since they have the same form structure
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ResponseActionCreate from './ResponseActionCreate';

export default function ResponseActionEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  // For now, just render the create page which handles both create and edit
  // In a real implementation, this would load the existing rule data
  return <ResponseActionCreate />;
}
