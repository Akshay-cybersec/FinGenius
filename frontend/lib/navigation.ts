import fs from 'fs';
import path from 'path';

// Map folder names to Lucide icons
export const iconMapping: Record<string, string> = {
  budget: "PieChart",
  invest: "TrendingUp",
  learn: "BookOpen",
  leaderboard: "Trophy",
  quiz: "BrainCircuit",
  profile: "User",
  dashboard: "LayoutDashboard",
  settings: "Settings",
};

export async function getFeatureNavItems() {
  // If running in browser, return static defaults
  if (typeof window !== 'undefined') {
    return [
      { name: "Overview", href: "/dashboard", iconKey: "LayoutDashboard", key: "overview" },
    ];
  }

  try {
    // CHANGE: Removed 'src/' from the path join
    const featuresDir = path.join(process.cwd(), 'features');
    
    if (!fs.existsSync(featuresDir)) return [];

    const files = fs.readdirSync(featuresDir);
    
    const features = files.filter(file => {
      return fs.statSync(path.join(featuresDir, file)).isDirectory();
    });

    const navItems = features.map(feature => ({
      name: feature.charAt(0).toUpperCase() + feature.slice(1),
      href: `/dashboard/${feature}`,
      iconKey: iconMapping[feature.toLowerCase()] || "Box",
      key: feature
    }));

    navItems.unshift({ 
        name: "Overview", 
        href: "/dashboard", 
        iconKey: "LayoutDashboard", 
        key: "overview" 
    });

    return navItems;
  } catch (error) {
    console.log("Error reading features:", error);
    return [];
  }
}