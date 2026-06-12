import json
from decouple import config
from django.conf import settings
from users.models import UserProfile
from groq import Groq

class RoadmapGeneratorService:
    """Service for generating AI-powered learning roadmaps using Groq API"""
    
    def __init__(self):
        # Initialize Groq client from environment using decouple
        self.api_key = config('GROQ_API_KEY', default=None)
        if not self.api_key:
            raise ValueError("GROQ_API_KEY environment variable not set. Add it to your .env file.")
        
        self.client = Groq(api_key=self.api_key)
        self.model_primary = "llama-3.3-70b-versatile"
        self.model_fallback = "llama-3.1-8b-instant"
    
    def collect_user_profile_data(self, user):
        """Collect user profile data for roadmap generation"""
        try:
            profile = UserProfile.objects.get(user=user)
        except UserProfile.DoesNotExist:
            return None
        
        return {
            'role': profile.role,
            'interests': profile.interests or "General STEM",
            'skills': profile.skills or "Basic programming",
            'learning_goals': profile.learning_goals or "Skill development",
            'experience_level': profile.experience_level,
            'domain': profile.domain or "Computer Science",
        }
    
    def validate_profile_data(self, profile_data):
        """Validate that profile has sufficient data for roadmap generation"""
        if not profile_data:
            return False, "Please complete your profile before generating a roadmap."
        
        required_fields = ['interests', 'learning_goals', 'experience_level']
        missing_fields = [field for field in required_fields if not profile_data.get(field)]
        
        if missing_fields:
            return False, f"Please complete your profile: {', '.join(missing_fields)}"
        
        return True, "Profile data validated"
    
    def generate_system_prompt(self, domain):
        """Generate domain-specific system prompt that acts like a real mentor"""
        domain_lower = domain.lower() if domain else "computer science"
        
        if "biology" in domain_lower or "life science" in domain_lower:
            return """You are an expert biology mentor with deep experience in laboratory research, field work, and academic instruction. 
Your task is to create personalized learning roadmaps for biology students and professionals.

When recommending resources and projects, prioritize:
- Laboratory techniques and experimental design
- Microscopy and biological visualization tools
- Scientific databases (NCBI, UniProt, PDB)
- Research methodologies and scientific writing
- Biological software relevant to their specialization

IMPORTANT: Only recommend programming tools (Python, R, etc.) if the student explicitly mentions bioinformatics, computational biology, genomics analysis, or AI in healthcare. For general biology learners, focus on domain-specific laboratory and research tools.

Generate roadmaps that reflect how a real biology mentor would guide their student based on career stage and specialization."""

        elif "physics" in domain_lower:
            return """You are an expert physics mentor with experience in theoretical physics, experimental design, and computational methods.
Your task is to create personalized learning roadmaps for physics students and professionals.

When recommending resources and projects, prioritize:
- Mathematical modeling and simulation tools
- Experimental methodology and measurement techniques
- Scientific computing tools specific to physics
- Physics visualization software
- Laboratory equipment familiarity

Only recommend general programming if it's essential for their specific physics domain (e.g., computational physics requires Python/C++).

Generate roadmaps that would be created by a physics professor guiding their student through their learning journey."""

        elif "chemistry" in domain_lower:
            return """You are an expert chemistry mentor with expertise in organic chemistry, inorganic chemistry, and analytical methods.
Your task is to create personalized learning roadmaps for chemistry students and professionals.

When recommending resources and projects, prioritize:
- Molecular visualization and modeling software
- Laboratory analysis techniques
- Chemical databases and literature resources
- Safety protocols and laboratory practices
- Spectroscopy and analytical instrumentation

Only recommend programming if it's directly relevant (e.g., computational chemistry, data analysis for analytical work).

Generate roadmaps that reflect how a working chemist would mentor someone entering the field."""

        elif "math" in domain_lower or "mathematics" in domain_lower:
            return """You are an expert mathematics mentor with deep knowledge across pure and applied mathematics.
Your task is to create personalized learning roadmaps for mathematics students and professionals.

When recommending resources and projects, prioritize:
- Proof techniques and mathematical rigor
- Mathematical software (Mathematica, Maple, MATLAB for specific applications)
- Statistical tools for applied mathematics
- Mathematical modeling and simulation
- Academic resources and mathematical literature

Programming recommendations should focus on mathematical applications (MATLAB, R for statistics, etc.) rather than general software engineering.

Generate roadmaps that a mathematics professor would create for their students."""

        elif "electronics" in domain_lower or "electrical" in domain_lower:
            return """You are an expert electronics and electrical engineering mentor with hands-on experience.
Your task is to create personalized learning roadmaps for electronics and electrical engineering students.

When recommending resources and projects, prioritize:
- Arduino and Raspberry Pi platforms
- Circuit design and simulation tools (SPICE, EAGLE)
- Embedded systems development
- Microcontroller programming (C, Assembly)
- PCB design tools
- Hardware prototyping and testing equipment

Generate roadmaps that reflect how an experienced electronics engineer would guide someone into the field."""

        elif "ai" in domain_lower or "machine learning" in domain_lower or "ml" in domain_lower:
            return """You are an expert AI and Machine Learning mentor with industry experience.
Your task is to create personalized learning roadmaps for AI/ML students and professionals.

When recommending resources and projects, prioritize:
- Core ML frameworks (TensorFlow, PyTorch)
- Programming languages (Python primarily)
- Deep learning architectures
- Dataset preparation and preprocessing
- ML engineering practices and deployment
- Specialized domains (NLP, Computer Vision, Reinforcement Learning, etc.)

Generate roadmaps that reflect how AI/ML professionals structure their learning and development."""

        else:
            # Default for Computer Science and general STEM
            return """You are an expert STEM mentor and curriculum designer with years of experience guiding students through technical fields.
Your task is to create personalized learning roadmaps for STEM learners at all levels.

When creating roadmaps:
- Consider the specific domain and career goals
- Recommend practical, industry-relevant tools and methodologies
- Prioritize hands-on projects that build real skills
- Provide a clear progression from fundamentals to advanced topics
- Match recommendations to the student's experience level and interests

Generate roadmaps that feel like they were created by a real mentor from that field."""

    def generate_user_prompt(self, profile_data):
        """Generate comprehensive, domain-aware user prompt for roadmap generation"""
        domain = profile_data.get('domain', 'Computer Science')
        interests = profile_data.get('interests', 'General STEM')
        skills = profile_data.get('skills', 'Foundational knowledge')
        learning_goals = profile_data.get('learning_goals', 'Skill development')
        experience_level = profile_data.get('experience_level', 'Beginner')
        role = profile_data.get('role', 'Student')
        
        prompt = f"""Create a highly personalized, realistic learning roadmap for:

**LEARNER PROFILE:**
- Role: {role}
- Domain: {domain}
- Current Experience Level: {experience_level}
- Learning Goals: {learning_goals}
- Current Skills: {skills}
- Interests: {interests}

**REQUIREMENTS:**
1. All recommendations MUST be specific to {domain}
2. Do NOT assume the learner needs generic programming unless it's genuinely relevant to their domain and goals
3. Projects must be realistic and domain-appropriate
4. Timeline should match the learner's experience level
5. Technologies should be those actually used by professionals in this field

**RESPOND WITH ONLY VALID JSON (no markdown, no code blocks, no explanations):**

{{
  "roadmap_title": "A clear, inspiring title that reflects their domain and goals",
  "learning_phases": [
    {{
      "phase": "Phase 1: Foundation",
      "description": "Fundamental concepts and tools they need to master",
      "duration": "Realistic time estimate"
    }},
    {{
      "phase": "Phase 2: Intermediate",
      "description": "Practical application and intermediate techniques",
      "duration": "Realistic time estimate"
    }},
    {{
      "phase": "Phase 3: Advanced",
      "description": "Specialized skills and domain expertise",
      "duration": "Realistic time estimate"
    }},
    {{
      "phase": "Phase 4: Expert",
      "description": "Professional-level work and specialization",
      "duration": "Realistic time estimate"
    }}
  ],
  "milestones": [
    "First achievement milestone",
    "Second achievement milestone",
    "Third achievement milestone",
    "Fourth achievement milestone",
    "Fifth achievement milestone"
  ],
  "suggested_projects": [
    {{
      "title": "Project 1 title",
      "description": "What they'll build/learn",
      "difficulty": "Beginner"
    }},
    {{
      "title": "Project 2 title",
      "description": "What they'll build/learn",
      "difficulty": "Intermediate"
    }},
    {{
      "title": "Project 3 title",
      "description": "What they'll build/learn",
      "difficulty": "Advanced"
    }},
    {{
      "title": "Project 4 title",
      "description": "What they'll build/learn",
      "difficulty": "Advanced"
    }}
  ],
  "recommended_technologies": [
    "Tool/platform 1 used by {domain} professionals",
    "Tool/platform 2 used by {domain} professionals",
    "Tool/platform 3 used by {domain} professionals",
    "Tool/platform 4 used by {domain} professionals",
    "Tool/platform 5 used by {domain} professionals"
  ],
  "estimated_timeline": "Total realistic time estimate to progress through all phases"
}}

Remember: This roadmap should reflect how a real {domain} mentor would guide this {experience_level} learner toward their goal of {learning_goals}."""
        
        return prompt
    
    def call_groq_api(self, system_prompt, user_prompt, model=None):
        """Call Groq API to generate roadmap using specified model with fallback support"""
        if model is None:
            model = self.model_primary
        
        try:
            response = self.client.chat.completions.create(
                model=model,
                messages=[
                    {
                        "role": "system",
                        "content": system_prompt
                    },
                    {
                        "role": "user",
                        "content": user_prompt
                    }
                ],
                temperature=0.7,
                max_tokens=2000
            )
            
            response_text = response.choices[0].message.content
            
            if not response_text:
                raise Exception("Empty response from Groq API")
            
            return response_text
        
        except Exception as e:
            # If primary model fails, try fallback
            if model == self.model_primary:
                error_str = str(e).lower()
                if any(keyword in error_str for keyword in ['timeout', 'rate_limit', '429', 'unavailable']):
                    # Automatically retry with fallback model
                    return self.call_groq_api(system_prompt, user_prompt, model=self.model_fallback)
            
            raise Exception(f"Groq API error: {str(e)}")
    
    def parse_response(self, response_text):
        """Parse AI response to extract JSON roadmap, handling markdown code blocks"""
        import re
        
        try:
            # First, try to find JSON within markdown code blocks (```json ... ```)
            json_match = re.search(r'```(?:json)?\s*\n?(.*?)\n?```', response_text, re.DOTALL)
            if json_match:
                json_str = json_match.group(1).strip()
            else:
                # Try to find raw JSON object
                json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
                if json_match:
                    json_str = json_match.group(0)
                else:
                    raise ValueError("No JSON found in response")
            
            roadmap_data = json.loads(json_str)
            return roadmap_data
        
        except json.JSONDecodeError as e:
            raise ValueError(f"Failed to parse AI response as JSON: {str(e)}")
    
    def generate_roadmap(self, user):
        """Main method to generate complete learning roadmap"""
        try:
            # Collect user profile data
            profile_data = self.collect_user_profile_data(user)
            
            # Validate profile data
            is_valid, message = self.validate_profile_data(profile_data)
            if not is_valid:
                return {"success": False, "error": message}
            
            # Generate domain-specific system prompt
            domain = profile_data.get('domain', 'Computer Science')
            system_prompt = self.generate_system_prompt(domain)
            
            # Generate user prompt
            user_prompt = self.generate_user_prompt(profile_data)
            
            # Call Groq API
            response_text = self.call_groq_api(system_prompt, user_prompt)
            
            # Parse response
            roadmap_data = self.parse_response(response_text)
            
            return {
                "success": True,
                "roadmap": roadmap_data
            }
        
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to generate roadmap: {str(e)}"
            }
