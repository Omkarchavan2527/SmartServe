export interface Service {
  title: string;
  description: string;
  color: string;
  icon: string;
}

export interface Worker {
  name: string;
  specialty: string;
  rating: number;
  imgsrc?: string; // <-- add this

}

export interface Testimonial {
  name: string;
  role: string;
  text: string;
  rating: number;
  color: string;
}

export interface FAQ {
  question: string;
  answer: string;
}