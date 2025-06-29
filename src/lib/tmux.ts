import { execSync } from 'child_process';
import { existsSync, writeFileSync, unlinkSync } from 'fs';
import chalk from 'chalk';

export interface TmuxWindow {
  index: number;
  name: string;
  active: boolean;
  panes: number;
}

export class TmuxOperations {
  private sessionName: string;
  private markerFile: string;

  constructor(sessionName: string) {
    this.sessionName = sessionName;
    this.markerFile = `/tmp/.tmux-${sessionName}-iterm`;
  }

  private exec(command: string): string {
    try {
      return execSync(command, { encoding: 'utf8' }).trim();
    } catch (error: any) {
      throw new Error(`Tmux command failed: ${error.message}`);
    }
  }

  private execSilent(command: string): boolean {
    try {
      execSync(command, { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  }

  hasSession(): boolean {
    return this.execSilent(`tmux has-session -t "${this.sessionName}"`);
  }

  hasWindow(windowName: string): boolean {
    if (!this.hasSession()) return false;
    
    const windows = this.listWindows();
    return windows.some(w => w.name === windowName);
  }

  listWindows(): TmuxWindow[] {
    if (!this.hasSession()) return [];

    try {
      const output = this.exec(
        `tmux list-windows -t "${this.sessionName}" -F "#{window_index}:#{window_name}:#{window_active}:#{window_panes}"`
      );
      
      return output.split('\n')
        .filter(line => line.trim())
        .map(line => {
          const [index, name, active, panes] = line.split(':');
          return {
            index: parseInt(index),
            name,
            active: active === '1',
            panes: parseInt(panes)
          };
        });
    } catch {
      return [];
    }
  }

  createWindow(windowName: string, workingDirectory: string): { windowIndex: number; firstPaneId: string } {
    let firstPaneId: string;
    
    if (!this.hasSession()) {
      // Create session with first window and capture pane ID
      const output = this.exec(
        `tmux new-session -d -s "${this.sessionName}" -n "${windowName}" -c "${workingDirectory}" -P -F "#{pane_id}"`
      );
      firstPaneId = output.trim();
    } else if (!this.hasWindow(windowName)) {
      // Add window to existing session and capture pane ID
      const output = this.exec(
        `tmux new-window -t "${this.sessionName}" -n "${windowName}" -c "${workingDirectory}" -P -F "#{pane_id}"`
      );
      firstPaneId = output.trim();
    } else {
      // Window already exists, get first pane ID
      const output = this.exec(
        `tmux list-panes -t "${this.sessionName}:${windowName}" -F "#{pane_id}" | head -1`
      );
      firstPaneId = output.trim();
    }

    // Get window index
    const windows = this.listWindows();
    const window = windows.find(w => w.name === windowName);
    return { windowIndex: window?.index ?? 0, firstPaneId };
  }

  switchToWindow(windowName: string): void {
    if (!this.hasWindow(windowName)) {
      throw new Error(`Window '${windowName}' not found`);
    }

    const windows = this.listWindows();
    const window = windows.find(w => w.name === windowName);
    
    if (window) {
      // Send switch command to all clients
      this.exec(`tmux send-keys -t "${this.sessionName}" C-b ${window.index}`);
    }
  }

  splitPane(windowName: string, workingDirectory: string, vertical: boolean = false): string {
    if (!this.hasWindow(windowName)) {
      throw new Error(`Window '${windowName}' not found`);
    }

    const splitFlag = vertical ? '-v' : '-h';
    const output = this.exec(
      `tmux split-window ${splitFlag} -t "${this.sessionName}:${windowName}" -c "${workingDirectory}" -P -F "#{pane_id}"`
    );
    
    return output.trim();
  }

  closeWindow(windowName: string): void {
    if (!this.hasWindow(windowName)) return;

    this.exec(`tmux kill-window -t "${this.sessionName}:${windowName}"`);
  }

  sendKeys(target: string, keys: string): void {
    this.exec(`tmux send-keys -t "${target}" "${keys}"`);
  }

  sendEnter(target: string): void {
    this.exec(`tmux send-keys -t "${target}" Enter`);
  }

  launchClaude(windowName: string, workingDirectory: string, _issueNumber: string): void {
    const { firstPaneId } = this.createWindow(windowName, workingDirectory);
    
    // Launch claude in the specific pane
    this.sendKeys(firstPaneId, 'claude');
    this.sendEnter(firstPaneId);
    
    // Wait for Claude to initialize
    console.log(chalk.gray('Waiting for Claude to initialize...'));
    setTimeout(() => {
      // Send the solve command to the specific pane
      this.sendKeys(firstPaneId, 'Solve the issue described in CLAUDE.md');
      this.sendEnter(firstPaneId);
      console.log(chalk.green('✓ Sent solve command to Claude'));
    }, 5000);
  }

  launchClaudeWithPrompt(windowName: string, workingDirectory: string, prompt: string): void {
    const { firstPaneId } = this.createWindow(windowName, workingDirectory);
    
    // Launch claude in the specific pane
    this.sendKeys(firstPaneId, 'claude');
    this.sendEnter(firstPaneId);
    
    // Wait for Claude to initialize
    console.log(chalk.gray('Waiting for Claude to initialize...'));
    setTimeout(() => {
      // Send the custom prompt to the specific pane
      this.sendKeys(firstPaneId, prompt);
      this.sendEnter(firstPaneId);
      console.log(chalk.green('✓ Sent prompt to Claude (Worker 1)'));
    }, 5000);
  }

  launchClaudeInPane(
    windowName: string, 
    workingDirectory: string, 
    _issueNumber: string,
    vertical: boolean = false
  ): void {
    const paneId = this.splitPane(windowName, workingDirectory, vertical);
    
    // Launch claude in the new pane
    this.sendKeys(paneId, 'claude');
    this.sendEnter(paneId);
    
    // Wait for Claude to initialize
    console.log(chalk.gray('Waiting for Claude to initialize...'));
    setTimeout(() => {
      // Send the solve command
      this.sendKeys(paneId, 'Solve the issue described in CLAUDE.md');
      this.sendEnter(paneId);
      console.log(chalk.green('✓ Sent solve command to Claude'));
    }, 5000);
  }

  launchClaudeInPaneWithPrompt(
    windowName: string,
    workingDirectory: string,
    prompt: string,
    vertical: boolean = false,
    workerNumber?: number
  ): void {
    const paneId = this.splitPane(windowName, workingDirectory, vertical);
    
    // Launch claude in the new pane
    this.sendKeys(paneId, 'claude');
    this.sendEnter(paneId);
    
    // Wait for Claude to initialize
    console.log(chalk.gray('Waiting for Claude to initialize...'));
    setTimeout(() => {
      // Send the custom prompt
      this.sendKeys(paneId, prompt);
      this.sendEnter(paneId);
      const workerInfo = workerNumber ? ` (Worker ${workerNumber})` : '';
      console.log(chalk.green(`✓ Sent prompt to Claude${workerInfo}`));
    }, 5000);
  }

  openITerm(windowIndex: number): void {
    const isNewSession = !existsSync(this.markerFile);
    
    if (isNewSession) {
      writeFileSync(this.markerFile, '');
      
      // Open new iTerm window and attach to tmux
      const script = `
        tell application "iTerm"
          activate
          create window with default profile
          tell current session of current window
            write text "tmux attach -t ${this.sessionName}"
            delay 0.5
            write text "${windowIndex}"
          end tell
        end tell
      `;
      
      execSync(`osascript -e '${script}'`);
    } else {
      // Just activate iTerm and switch window
      const script = `
        tell application "iTerm"
          activate
        end tell
      `;
      
      execSync(`osascript -e '${script}'`);
      this.sendKeys(this.sessionName, `C-b ${windowIndex}`);
    }
  }

  cleanupMarkerFile(): void {
    if (existsSync(this.markerFile)) {
      unlinkSync(this.markerFile);
    }
  }
}