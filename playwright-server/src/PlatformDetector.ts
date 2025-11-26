export class PlatformDetector {
  detect(url: string): string {
    // Greenhouse
    if (url.includes('greenhouse.io') || url.includes('boards.greenhouse.io')) {
      return 'greenhouse';
    }
    
    // Lever
    if (url.includes('lever.co') || url.includes('jobs.lever.co')) {
      return 'lever';
    }
    
    // Workday
    if (url.includes('myworkdayjobs.com') || url.includes('workday.com')) {
      return 'workday';
    }
    
    // Ashby
    if (url.includes('ashbyhq.com') || url.includes('jobs.ashbyhq.com')) {
      return 'ashby';
    }
    
    // BambooHR
    if (url.includes('bamboohr.com')) {
      return 'bamboohr';
    }
    
    // JazzHR
    if (url.includes('jazz.co') || url.includes('applytojob.com')) {
      return 'jazzhr';
    }
    
    // SmartRecruiters
    if (url.includes('smartrecruiters.com')) {
      return 'smartrecruiters';
    }
    
    // Generic/Unknown
    return 'generic';
  }
}
