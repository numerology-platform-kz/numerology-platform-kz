-- Казахская версия: разрешаем новые разделы moonsun, prognostika, karmic
do $$
declare r record;
begin
  for r in
    select conrelid::regclass::text as tbl, conname
    from pg_constraint
    where contype = 'c'
      and connamespace = 'public'::regnamespace
      and conrelid::regclass::text in ('calculation_history','platform_materials','test_questions','test_attempts')
      and pg_get_constraintdef(oid) ilike '%direction%'
  loop
    execute format('alter table public.%I drop constraint %I', r.tbl, r.conname);
  end loop;
end $$;
