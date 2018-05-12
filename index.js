import iconFinder from './iconfinder';
import TabIcon from './TabIcon';

let cwd = '';
let iconData = undefined;

const setCwd = (pid, action) => {
    if (process.platform == 'win32') {
        let directoryRegex = /([a-zA-Z]:[^\:\[\]\?\"\<\>\|]+)/mi;
        if (action && action.data) {
            let path = directoryRegex.exec(action.data);
            if(path){
                cwd = path[0];
            }
        }
    } else {
        exec(`lsof -p ${pid} | awk '$4=="cwd"' | tr -s ' ' | cut -d ' ' -f9-`, (err, stdout) => {
            cwd = stdout.trim();

            iconFinder(cwd)
            .then(icon => { iconData = icon; })
            .catch(error => { iconData = undefined; });
        });
    }

};

exports.middleware = (store) => (next) => (action) => {
    const uids = store.getState().sessions.sessions;

    switch (action.type) {
        case 'SESSION_SET_XTERM_TITLE':
            pid = uids[action.uid].pid;
            break;

        case 'SESSION_ADD':
            pid = action.pid;
            setCwd(pid);
            break;

        case 'SESSION_ADD_DATA':
            const { data } = action;
            const enterKey = data.indexOf('\n') > 0;

            if (enterKey) {
                setCwd(pid, action);
            }
            break;

        case 'SESSION_SET_ACTIVE':
            pid = uids[action.uid].pid;
            setCwd(pid);
            break;
    }

    next(action);
};


export const getTabProps = (uid, parentProps, props) => {
  const newProps = { ...props };
  newProps.text = (
    <span>
      <span style={{ verticalAlign: 'middle' }}>{props.text}</span>
    </span>
  );
  return newProps;
};

export const getTabsProps = (parentProps, props) => {
  if (props.tabs.length !== 1 || typeof props.tabs[0].title !== 'string') return props;
  const newProps = { ...props };
  newProps.tabs[0].title = (
    <span>
      <span style={{ verticalAlign: 'middle' }}>{props.tabs[0].title}</span>
    </span>
  );
  return newProps;
};
