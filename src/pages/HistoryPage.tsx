
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  ArrowLeft, 
  Building, 
  Users, 
  Search, 
  Calendar,
  Shield,
  Phone,
  Hash,
  User
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import SEOHead from '@/components/SEOHead';
import { getPageMetadata } from '@/lib/seo';

interface Organization {
  id: string;
  name: string;
  alias: string | null;
  description: string | null;
  organization_number: string | null;
  created_at: string;
}

interface UserProfile {
  id: string;
  username: string;
  display_name: string;
  user_type: string;
  organization_id: string;
  department_id: string | null;
  is_active: boolean;
  tracking_id: string | null;
  phone_number: string | null;
  created_at: string;
}

const HistoryPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const pageMetadata = getPageMetadata('dashboard');
  
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch organizations
      const { data: orgsData, error: orgsError } = await supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: false });

      if (orgsError) {
        console.error('Error fetching organizations:', orgsError);
        toast({
          title: "❌ Error fetching organizations",
          description: orgsError.message,
          variant: "destructive"
        });
      } else {
        setOrganizations(orgsData || []);
      }

      // Fetch users
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) {
        console.error('Error fetching users:', usersError);
        toast({
          title: "❌ Error fetching users",
          description: usersError.message,
          variant: "destructive"
        });
      } else {
        setUsers(usersData || []);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "💥 Unexpected error",
        description: 'Failed to load data.',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const cleanSearchTerm = searchTerm.replace(/[^\w\s-]/g, '').trim();

  const filteredOrganizations = organizations.filter(org =>
    org.name.toLowerCase().includes(cleanSearchTerm.toLowerCase()) ||
    (org.alias && org.alias.toLowerCase().includes(cleanSearchTerm.toLowerCase())) ||
    (org.organization_number && org.organization_number.toLowerCase().includes(cleanSearchTerm.toLowerCase()))
  );

  const filteredUsers = users.filter(user =>
    user.display_name.toLowerCase().includes(cleanSearchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(cleanSearchTerm.toLowerCase()) ||
    user.user_type.toLowerCase().includes(cleanSearchTerm.toLowerCase()) ||
    (user.tracking_id && user.tracking_id.toLowerCase().includes(cleanSearchTerm.toLowerCase())) ||
    (user.phone_number && user.phone_number.includes(cleanSearchTerm))
  );

  const getOrganizationName = (orgId: string) => {
    const org = organizations.find(o => o.id === orgId);
    return org?.name || 'Unknown Organization';
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'org_admin': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'manager': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'employee': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <SEOHead
        title={`${pageMetadata.title} - History`}
        description="Complete system history and user management overview"
        keywords={pageMetadata.keywords}
        canonicalUrl={`${pageMetadata.canonical}/history`}
        pageName="history"
      />
      
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/super-admin')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    System History
                  </h1>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Complete overview of organizations and users
                  </p>
                </div>
              </div>
            </div>
            
            {/* Search */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search organizations, users, roles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-80"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Organizations Section */}
          <Card className="border-0 shadow-xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-800 dark:to-blue-700 border-b">
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 text-blue-600" />
                Organizations ({filteredOrganizations.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Organization ID</TableHead>
                      <TableHead>Alias</TableHead>
                      <TableHead>Users Count</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrganizations.map((org) => (
                      <TableRow key={org.id}>
                        <TableCell className="font-medium">{org.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono text-xs">
                            {org.organization_number || 'Not assigned'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {org.alias && (
                            <Badge variant="secondary">{org.alias}</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {users.filter(u => u.organization_id === org.id).length} users
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-slate-500">
                            <Calendar className="h-4 w-4" />
                            {new Date(org.created_at).toLocaleDateString()}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Users Section */}
          <Card className="border-0 shadow-xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-800 dark:to-green-700 border-b">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                Users ({filteredUsers.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Organization</TableHead>
                      <TableHead>Tracking ID</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{user.display_name}</div>
                            <div className="text-sm text-slate-500">@{user.username}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getRoleColor(user.user_type)}>
                            {user.user_type.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Building className="h-4 w-4 text-slate-400" />
                            {getOrganizationName(user.organization_id)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {user.tracking_id && (
                            <Badge variant="outline" className="font-mono text-xs">
                              {user.tracking_id}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {user.phone_number && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-4 w-4 text-slate-400" />
                              <span className="text-sm">{user.phone_number}</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.is_active ? "default" : "secondary"}>
                            {user.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-slate-500">
                            <Calendar className="h-4 w-4" />
                            {new Date(user.created_at).toLocaleDateString()}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default HistoryPage;
