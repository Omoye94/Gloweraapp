-- Replace task_1_done / task_2_done with a flexible tasks_done JSONB array
ALTER TABLE user_challenge_days ADD COLUMN tasks_done JSONB DEFAULT '[]'::jsonb;

UPDATE user_challenge_days SET tasks_done = jsonb_build_array(
  COALESCE(task_1_done, false), COALESCE(task_2_done, false));

ALTER TABLE user_challenge_days DROP COLUMN task_1_done, DROP COLUMN task_2_done;
