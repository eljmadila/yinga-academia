import { Metadata, ResolvingMetadata } from 'next';

type Props = {
  params: { courseId: string; locale: string }
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const id = params.courseId;
  
  try {
    const res = await fetch(`http://localhost:8000/api/courses/${id}/`);
    if (res.ok) {
      const course = await res.json();
      return {
        title: `${course.title} | Yinga Academia`,
        description: course.description || `Découvrez la formation ${course.title} sur Yinga Academia.`,
        openGraph: {
          title: `${course.title} | Yinga Academia`,
          description: course.description || `Découvrez la formation ${course.title} sur Yinga Academia.`,
          images: course.thumbnail ? [{ url: course.thumbnail }] : [],
          type: 'website',
        }
      };
    }
  } catch (err) {
    console.error("Failed to fetch course for metadata", err);
  }

  return {
    title: 'Détails du cours | Yinga Academia',
    description: 'Détails de la formation sur Yinga Academia.'
  };
}

export default function CourseDetailsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
