
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

interface ProfileData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  userType: string;
  lastNameChange: string | null;
}

export function ProfileDetails() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [canChangeName, setCanChangeName] = useState(false);
  
  useEffect(() => {
    if (!user) return;
    
    async function loadProfile() {
      setIsLoading(true);
      try {
        // Get user metadata from Supabase auth
        const { data: userData, error: userError } = await supabase.auth.getUser();
        
        if (userError) throw userError;
        
        if (userData && userData.user) {
          const metadata = userData.user.user_metadata;
          const email = userData.user.email || "";
          
          // Calculate if user can change name
          const lastNameChange = metadata.last_name_change ? new Date(metadata.last_name_change) : null;
          const canChange = !lastNameChange || 
                           (new Date().getTime() - new Date(lastNameChange).getTime()) > (30 * 24 * 60 * 60 * 1000);
          
          setProfileData({
            id: userData.user.id,
            email: email,
            firstName: metadata.first_name || "",
            lastName: metadata.last_name || "",
            phone: metadata.phone || "",
            userType: metadata.user_type || "",
            lastNameChange: metadata.last_name_change || null
          });
          
          setFirstName(metadata.first_name || "");
          setLastName(metadata.last_name || "");
          setCanChangeName(canChange);
        }
      } catch (error) {
        console.error("Error loading profile:", error);
        toast({
          title: "Failed to load profile",
          description: "There was a problem loading your profile information.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    loadProfile();
  }, [user, toast]);
  
  const handleUpdateName = async () => {
    if (!user || !canChangeName) return;
    
    setIsUpdating(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { 
          first_name: firstName,
          last_name: lastName,
          last_name_change: new Date().toISOString()
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Profile updated",
        description: "Your name has been updated successfully.",
      });
      
      // Update the profile data
      if (profileData) {
        setProfileData({
          ...profileData,
          firstName,
          lastName,
          lastNameChange: new Date().toISOString()
        });
      }
      
      // Update can change name status
      setCanChangeName(false);
      
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update failed",
        description: "There was a problem updating your profile.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-36 w-full" />
        <Skeleton className="h-36 w-full" />
      </div>
    );
  }
  
  if (!profileData) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Profile information not available</p>
      </div>
    );
  }
  
  const daysToNextNameChange = profileData.lastNameChange ? 
    30 - Math.floor((new Date().getTime() - new Date(profileData.lastNameChange).getTime()) / (24 * 60 * 60 * 1000)) : 0;
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>
            Your basic account information.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={profileData.email} readOnly disabled />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" value={profileData.phone} readOnly disabled />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="userType">Account Type</Label>
            <Input 
              id="userType" 
              value={profileData.userType.charAt(0).toUpperCase() + profileData.userType.slice(1)} 
              readOnly 
              disabled 
            />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Your Name</CardTitle>
          <CardDescription>
            {canChangeName 
              ? "You can update your name once every 30 days." 
              : `You can change your name again in ${daysToNextNameChange} days.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input 
                id="firstName" 
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={!canChangeName || isUpdating} 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input 
                id="lastName" 
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={!canChangeName || isUpdating} 
              />
            </div>
          </div>
          
          {canChangeName && (
            <Button 
              onClick={handleUpdateName} 
              disabled={isUpdating || !firstName.trim() || !lastName.trim()}
              className="w-full md:w-auto mt-2"
            >
              {isUpdating ? "Updating..." : "Update Name"}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
