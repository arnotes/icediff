export interface ICommit {
  hash: string; 
  parent1: string;
  parent2: string;
  strParents: string; 
  refs: string; 
  subject: string; 
  email: string; 
  dateRelative: string;
}