import { ComplaintLoadingState } from '@/components/complaint';
import { useResolvedUserRole } from '@/hooks/useResolvedUserRole';
import { StaffComplaintsScreen } from '@/screens/complaints/StaffComplaintsScreen';
import { UserComplaintsScreen } from '@/screens/complaints/UserComplaintsScreen';
import { isStaffRole } from '@/utils/complaints';

export default function ComplaintsScreen() {
  const { role, loading } = useResolvedUserRole();

  if (loading) {
    return <ComplaintLoadingState />;
  }

  if (isStaffRole(role)) {
    return <StaffComplaintsScreen isAdmin={role?.toLowerCase() === 'admin'} />;
  }

  return <UserComplaintsScreen />;
}
