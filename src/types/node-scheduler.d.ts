declare module 'node-schedule' {
    export function scheduleJob(cron: string, job: () => void)
}