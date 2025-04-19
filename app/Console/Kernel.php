<?php

protected function schedule(Schedule $schedule)
{
    $schedule->command('route:call api/device-schedules/apply')
             ->everyMinute();
}
