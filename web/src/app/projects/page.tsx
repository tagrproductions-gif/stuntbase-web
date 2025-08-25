import { Metadata } from 'next'
import ProjectsClient from './projects-client'

export const metadata: Metadata = {
  title: 'Project Databases - StuntPitch',
  description: 'Submit your stunt performer profile to project-specific casting databases. Get discovered by stunt coordinators and casting directors for upcoming film and TV productions.',
  openGraph: {
    title: 'Project Databases - StuntPitch',
    description: 'Submit your stunt performer profile to project-specific casting databases. Get discovered by stunt coordinators and casting directors for upcoming film and TV productions.',
    url: 'https://stuntpitch.com/projects',
    siteName: 'StuntPitch',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Project Databases - StuntPitch',
    description: 'Submit your stunt performer profile to project-specific casting databases. Get discovered by stunt coordinators and casting directors for upcoming film and TV productions.',
  },
}

export default function ProjectsPage() {
  return <ProjectsClient />
}