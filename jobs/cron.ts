import { exec } from 'child_process'
import { readdir, stat, unlink } from 'fs'
import * as cron from 'node-cron'
import { promisify } from 'util'
import { cleanTrainingJob } from './clean-training-job'

export function getIsoDate() {
  return new Date().toISOString().replace('T', '_').split('.')[0].replace(/:/g, '-')
}

const execAsync = promisify(exec)
const readdirAsync = promisify(readdir)
const statAsync = promisify(stat)
const unlinkAsync = promisify(unlink)

if (process.env.NODE_ENV === 'production') {

  const oneWeekInMillis = 7 * 24 * 60 * 60 * 1000
  const backupsFolder = '/backups'

  // Dump
  cron.schedule('0 4 * * *', async () => {
    try {
      const dumpFileName = `${backupsFolder}/backup_${getIsoDate()}.sql.gz`
      const command = `pg_dump -d ${process.env.DATABASE_URL} -f ${dumpFileName} -Z1`
      const { stdout, stderr } = await execAsync(command)
      console.log(getIsoDate(), 'Dump Completed', stdout, stderr)
    } catch (error) {
      console.error(getIsoDate(), 'Dump error:', error)
    }
  })
  console.log('Dump cron added')

  // Clean dump
  cron.schedule('30 4 * * 0', async () => {
    const files = await readdirAsync(backupsFolder)
    for (const file of files) {
      const stats = await statAsync(`${backupsFolder}/${file}`)
      if (Date.now() - stats.mtimeMs > oneWeekInMillis) {
        await unlinkAsync(`${backupsFolder}/${file}`)
        console.log(`DUMP DELETED : ${file}`)
      }
    }
  })
  console.log('Clean Dump cron added')
}

// Clean training
cron.schedule('0 3 * * *', async () => {
  try {
    const result =  await cleanTrainingJob()
    console.log(getIsoDate(), 'Training Rooms deleted:', result)
  } catch (error) {
    console.error(getIsoDate(), 'Delete Room Error:', error)
  }
})
console.log('Clean training job cron added')
