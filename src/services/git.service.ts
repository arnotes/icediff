// eslint-disable-next-line
import { GitProcess } from 'dugite';
import { ICommit } from '../models/commit.interface';
const dugite = window.require('dugite');

const pathToRepository = 'C:/END-Atomology/deploy/end-web';
const sep = '!===!';

const addSep = (str:string)=>{
  return sep+str;
}

const splitRaw = (raw:string)=>{
  const splitted = raw.split('\n');
  return splitted.slice(0, splitted.length - 1);
}

class GitService{
  private exec = dugite.GitProcess.exec as typeof GitProcess.exec;
  async gitBranch(){
    const r = await this.exec(['branch'],pathToRepository);
    let branches = splitRaw(r.stdout);
    let currentBranch = branches.find(x => x.startsWith('*'));

    branches = branches.map(x => x.replace('* ','').replace('  ',''));
    currentBranch = currentBranch.replace('* ','');

    return {
      currentBranch,
      branches
    }
  }

  async gitdiffSideBySide(beforeHash:string,afterHash:string,fileName:string){
    const beforeFile = await this.gitShowFile(beforeHash,fileName);
    const afterFile = await this.gitShowFile(afterHash,fileName);
    console.log({beforeFile,afterFile});
    return {beforeFile,afterFile};
  }

  async gitShowFile(hash:string,fileName:string){
    const result = await this.exec([
      'show',
      `${hash}:${fileName}`
    ],pathToRepository);
    return result.stdout;
  }

  async gitdiffFiles(before:string,after:string){
    let files:string[] = [];

    const command = ['diff','--name-only',before,after];
    const result = await this.exec(command,pathToRepository);

    files = splitRaw(result.stdout);

    return files;
  }

  async gitlog({
      subject = '',
      branches = 'dev',
      skip = 0
                                  } = {}){

    const command = [
      'log',
      '--oneline',
      '--max-count=100',
      `--pretty="%h${sep}%p${sep}%d${sep}%s${sep}%ae${sep}"`,
      `--pretty=%h${addSep('%ps')+addSep('%d')+addSep('%s')+addSep('%ae')+addSep('%ar')}`
    ];
    if(subject){
     command.push(`--grep=${subject}`);
     command.push('--regexp-ignore-case');
    }  
    branches && command.push(`--branches=*${branches}`);
    skip && command.push(`--skip=${skip}`);

    const r = await this.exec(command, pathToRepository);
    const logs = splitRaw(r.stdout);
    const parsed = logs.map<ICommit>(log => {
      const [hash,strParents,refs,subject,email,dateRelative] = log.split(sep);
      const [parent1,parent2] = strParents.split(' ');
      return {hash,strParents,parent1,parent2,refs,subject,email,dateRelative};
    });

    return parsed;
  }
}

export const gitSvc = new GitService();