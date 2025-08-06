from pydantic import BaseModel, HttpUrl

class Related(BaseModel):
    link: HttpUrl        
    favicon: HttpUrl      
    title: str         
    source: str           
