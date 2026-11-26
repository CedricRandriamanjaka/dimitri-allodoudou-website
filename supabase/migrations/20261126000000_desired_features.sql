-- Nouvelle liste des fonctionnalités souhaitées (codes identiques à lib/survey.js).
-- NOT VALID : les anciennes réponses (codes retirés) restent en base sans être revalidées.

alter table public.survey_responses
  drop constraint if exists survey_responses_desired_features_check;

alter table public.survey_responses
  add constraint survey_responses_desired_features_check check (
    cardinality(desired_features) between 1 and 3
    and desired_features <@ array['profils_verifies','controle_messages','album_prive','evenements','disponibilites','envoi_prive','groupes_prives','avis_membres','story_24h','reductions_clubs','message_unique']
  ) not valid;
