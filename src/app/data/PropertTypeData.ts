export interface PropertyType{
id: string,   
name: string,
description: string,
}


export interface PropertyFormProps {
  initialData?: any;                 // property data to edit
  mode?: "create" | "edit";          // editing mode
  onSuccess?: () => void;            // callback after update/save
}


