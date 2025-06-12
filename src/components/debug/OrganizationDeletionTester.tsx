import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Trash2, TestTube, CheckCircle, XCircle } from 'lucide-react';

export default function OrganizationDeletionTester() {
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);
  const { toast } = useToast();

  const runDeletionTest = async () => {
    setIsTestRunning(true);
    setTestResults([]);
    const results: any[] = [];

    try {
      // Step 1: Create test organization
      results.push({ step: 'Creating test organization...', status: 'running' });
      setTestResults([...results]);

      const testOrgData = {
        name: 'TEST_DELETE_ME_' + Date.now(),
        settings_json: {
          alias: 'TEST',
          description: 'Test organization for deletion verification'
        }
      };

      const { data: newOrg, error: createError } = await supabase
        .from('organisations')
        .insert([testOrgData])
        .select()
        .single();

      if (createError) {
        results[0] = { 
          step: 'Creating test organization', 
          status: 'failed', 
          error: createError.message 
        };
        setTestResults([...results]);
        return;
      }

      results[0] = { 
        step: 'Creating test organization', 
        status: 'success', 
        data: `Created: ${newOrg.name} (${newOrg.id})` 
      };
      setTestResults([...results]);

      // Step 2: Test safe deletion function
      results.push({ step: 'Testing safe deletion function...', status: 'running' });
      setTestResults([...results]);

      const { data: deleteResult, error: deleteError } = await supabase.rpc('safe_delete_organisation', {
        org_id: newOrg.id
      });

      if (deleteError) {
        results[1] = { 
          step: 'Testing safe deletion function', 
          status: 'failed', 
          error: deleteError.message 
        };
        setTestResults([...results]);
        
        // Clean up manually
        await supabase.from('organisations').delete().eq('id', newOrg.id);
        return;
      }

      if (!deleteResult?.success) {
        results[1] = { 
          step: 'Testing safe deletion function', 
          status: 'failed', 
          error: deleteResult?.error || 'Deletion returned false' 
        };
        setTestResults([...results]);
        return;
      }

      results[1] = { 
        step: 'Testing safe deletion function', 
        status: 'success', 
        data: `Deleted ${deleteResult.deleted_counts.profiles} users, ${deleteResult.deleted_counts.departments} departments` 
      };
      setTestResults([...results]);

      // Step 3: Verify deletion
      results.push({ step: 'Verifying organization is deleted...', status: 'running' });
      setTestResults([...results]);

      const { data: checkOrg } = await supabase
        .from('organisations')
        .select('*')
        .eq('id', newOrg.id)
        .single();

      if (checkOrg) {
        results[2] = { 
          step: 'Verifying organization is deleted', 
          status: 'failed', 
          error: 'Organization still exists after deletion' 
        };
        setTestResults([...results]);
        return;
      }

      results[2] = { 
        step: 'Verifying organization is deleted', 
        status: 'success', 
        data: 'Organization successfully removed from database' 
      };
      setTestResults([...results]);

      toast({
        title: "✅ Deletion Test Passed",
        description: "Organization deletion is working correctly!",
      });

    } catch (error: any) {
      results.push({ 
        step: 'Unexpected error', 
        status: 'failed', 
        error: error.message 
      });
      setTestResults([...results]);

      toast({
        title: "❌ Test Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsTestRunning(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running': return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />;
      default: return null;
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          Organization Deletion Functionality Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            This test will create and immediately delete a test organization to verify the deletion functionality works correctly.
          </p>
          <Button 
            onClick={runDeletionTest} 
            disabled={isTestRunning}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            {isTestRunning ? 'Testing...' : 'Run Test'}
          </Button>
        </div>

        {testResults.length > 0 && (
          <div className="space-y-2 border rounded-lg p-4 bg-slate-50 dark:bg-slate-900">
            <h4 className="font-medium text-sm">Test Results:</h4>
            {testResults.map((result, index) => (
              <div key={index} className="flex items-start gap-2 text-sm">
                {getStatusIcon(result.status)}
                <div className="flex-1">
                  <span className="font-medium">{result.step}</span>
                  {result.status === 'success' && result.data && (
                    <div className="text-green-600 dark:text-green-400 text-xs mt-1">
                      {result.data}
                    </div>
                  )}
                  {result.status === 'failed' && result.error && (
                    <div className="text-red-600 dark:text-red-400 text-xs mt-1">
                      Error: {result.error}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-xs text-muted-foreground border-t pt-4">
          <p><strong>If this test passes:</strong> Organization deletion is working correctly</p>
          <p><strong>If this test fails:</strong> There may be permission or database issues preventing deletion</p>
        </div>
      </CardContent>
    </Card>
  );
}
