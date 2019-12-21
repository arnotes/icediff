// eslint-disable-next-line
import { GitProcess } from 'dugite';
const dugite = window.require('dugite');

const pathToRepository = 'C:/END-Atomology/deploy/end-web';
const sep = '!===!';

const addSep = (str:string)=>{
  return sep+str;
}

class GitService{
  private exec = dugite.GitProcess.exec as typeof GitProcess.exec;
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
      `--pretty="%h${addSep('%ps')+addSep('%d')+addSep('%s')+addSep('%ae')+addSep('%ar')}`
    ];
    subject && command.push(`--grep=${subject}`);
    branches && command.push(`--branches=*${branches}`);
    skip && command.push(`--skip=${skip}`);

    const r = await this.exec(command, pathToRepository);
    const logs = r.stdout.split('\n');
    const parsed = logs.map(log => {
      const [hash,strParents,refs,subject,email,dateRelative] = log.split(sep);
      return {hash,strParents,refs,subject,email,dateRelative};
    });
    console.log(parsed);
    return parsed;
  }
}

export const gitSvc = new GitService();