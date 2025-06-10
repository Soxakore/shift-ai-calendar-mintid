import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useToast } from '@/hooks/use-toast';

export default function DataDebugComponent() {
  const [debugData, setDebugData] = useState({
    organizations: [],
    profiles: [],
    currentUser: null,
    errors: []
  });
  const { user, profile } = useSupabaseAuth();
  const { toast } = useToast();

  const runDebugTests = useCallback(async () => {
    const errors = [];
    let organizations = [];
    let profiles = [];

    try {
      console.log('🔍 Starting debug tests...');
      
      // Test 1: Fetch organizations
      console.log('📋 Test 1: Fetching organizations...');
      const { data: orgsData, error: orgsError } = await supabase
        .from('organisations')
        .select('*')
        .order('name');
      
      if (orgsError) {
        console.error('❌ Organizations error:', orgsError);
        errors.push(`Organizations: ${orgsError.message}`);
      } else {
        organizations = orgsData || [];
        console.log('✅ Organizations fetched:', organizations.length);
      }

      // Test 2: Fetch profiles
      console.log('📋 Test 2: Fetching profiles...');
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (profilesError) {
        console.error('❌ Profiles error:', profilesError);
        errors.push(`Profiles: ${profilesError.message}`);
      } else {
        profiles = profilesData || [];
        console.log('✅ Profiles fetched:', profiles.length);
      }

      // Test 3: Test organization creation
      console.log('📋 Test 3: Testing organization creation...');
      const testOrgData = {
        name: `Test Org ${Date.now()}`,
        settings_json: {
          alias: 'test',
          description: 'Debug test organization'
        }
      };

      const { data: newOrg, error: createError } = await supabase
        .from('organisations')
        .insert([testOrgData])
        .select()
        .single();

      if (createError) {
        console.error('❌ Create organization error:', createError);
        errors.push(`Create Org: ${createError.message}`);
      } else {
        console.log('✅ Organization created successfully:', newOrg);
        
        // Clean up - delete the test organization
        await supabase.from('organisations').delete().eq('id', newOrg.id);
      }

    } catch (error) {
      console.error('💥 Debug test exception:', error);
      errors.push(`Exception: ${error.message}`);
    }

    setDebugData({
      organizations,
      profiles,
      currentUser: user,
      errors
    });

    // Show results in toast
    if (errors.length === 0) {
      toast({
        title: "✅ Debug Tests Passed",
        description: `Found ${organizations.length} orgs, ${profiles.length} users`,
      });
    } else {
      toast({
        title: "❌ Debug Tests Failed",
        description: `${errors.length} errors found`,
        variant: "destructive"
      });
    }
  }, [user, toast]);

  useEffect(() => {
    // Run tests automatically when component mounts
    runDebugTests();
  }, [runDebugTests]);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          🔍 Data Debug Dashboard
          <Button onClick={runDebugTests} variant="outline">
            Refresh Tests
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current User Info */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900">Current User</h3>
          <div className="text-sm text-blue-700">
            <p>Email: {user?.email || 'Not logged in'}</p>
            <p>Profile: {profile?.display_name || 'No profile'}</p>
            <p>Role: {profile?.user_type || 'Unknown'}</p>
          </div>
        </div>

        {/* Organizations */}
        <div className="p-4 bg-green-50 rounded-lg">
          <h3 className="font-semibold text-green-900">Organizations ({debugData.organizations.length})</h3>
          <div className="text-sm text-green-700 max-h-32 overflow-y-auto">
            {debugData.organizations.length > 0 ? (
              debugData.organizations.map((org, idx) => (
                <div key={idx} className="border-b border-green-200 py-1">
                  {org.name} (ID: {org.id})
                </div>
              ))
            ) : (
              <p>No organizations found</p>
            )}
          </div>
        </div>

        {/* Profiles */}
        <div className="p-4 bg-purple-50 rounded-lg">
          <h3 className="font-semibold text-purple-900">User Profiles ({debugData.profiles.length})</h3>
          <div className="text-sm text-purple-700 max-h-32 overflow-y-auto">
            {debugData.profiles.length > 0 ? (
              debugData.profiles.map((profile, idx) => (
                <div key={idx} className="border-b border-purple-200 py-1">
                  {profile.display_name} ({profile.username}) - {profile.user_type}
                </div>
              ))
            ) : (
              <p>No profiles found</p>
            )}
          </div>
        </div>

        {/* Errors */}
        {debugData.errors.length > 0 && (
          <div className="p-4 bg-red-50 rounded-lg">
            <h3 className="font-semibold text-red-900">Errors ({debugData.errors.length})</h3>
            <div className="text-sm text-red-700">
              {debugData.errors.map((error, idx) => (
                <div key={idx} className="py-1">
                  ❌ {error}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
