// src/pages/ExplainerPage.tsx

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { explainerApi } from '../api';

const TMDB = 'https://image.tmdb.org/t/p/w92';

//helpers

function Bar({ value, max = 1, color = '#6366f1' }: {
  value: number; max?: number; color?: string;
}) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{
        flex: 1, height: 6, background: '#1f2937',
        borderRadius: 3, overflow: 'hidden',
      }}>
        <div style={{
          width: `${pct}%`, height: '100%',
          background: color, borderRadius: 3,
          transition: 'width .4s ease',
        }} />
      </div>
      <span style={{ fontSize: 11, color: '#9ca3af', minWidth: 44, textAlign: 'right' }}>
        {value.toFixed(4)}
      </span>
    </div>
  );
}

function Card({ title, accent = '#6366f1', children }: {
  title: string; accent?: string; children: React.ReactNode;
}) {
  return (
    <div style={{
      background: '#111827', border: `1px solid #1f2937`,
      borderLeft: `3px solid ${accent}`,
      borderRadius: 12, padding: '20px 24px', marginBottom: 16,
    }}>
      <div style={{
        fontSize: 11, fontFamily: 'monospace', color: accent,
        textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12,
      }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function Formula({ tex }: { tex: string }) {
  return (
    <div style={{
      background: '#0f172a', border: '1px solid #1e293b',
      borderRadius: 8, padding: '10px 16px', margin: '8px 0',
      fontFamily: 'monospace', fontSize: 13, color: '#a5b4fc',
      overflowX: 'auto', whiteSpace: 'pre',
    }}>
      {tex}
    </div>
  );
}

function Pill({ label, value, color = '#6366f1' }: {
  label: string; value: string | number; color?: string;
}) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: '#1f2937', borderRadius: 20, padding: '3px 10px',
      fontSize: 12, margin: '2px',
    }}>
      <span style={{ color: '#6b7280' }}>{label}</span>
      <span style={{ color, fontFamily: 'monospace', fontWeight: 600 }}>
        {typeof value === 'number' ? value.toFixed(4) : value}
      </span>
    </div>
  );
}

//Content-Based Section

function ContentBasedView({ data }: { data: any }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div>

      {/*Survey*/}
      <Card title="Step 1 — Survey contribution (weight × 0.4)" accent="#10b981">
        <p style={{ color: '#6b7280', fontSize: 12, marginBottom: 12 }}>
          Each genre preference from the survey is multiplied by 0.4 to form the base user vector.
        </p>
        <Formula tex="survey_contribution[genre] = survey_weight × 0.4" />
        {data.surveyContribution.length === 0 ? (
          <p style={{ color: '#4b5563', fontSize: 12 }}>No survey data found.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {data.surveyContribution.map((e: any) => (
              <div key={e.key}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                  <span style={{ color: '#d1d5db', fontSize: 12, fontFamily: 'monospace' }}>
                    {e.key}
                  </span>
                </div>
                <Bar value={e.value} color="#10b981" />
              </div>
            ))}
          </div>
        )}
      </Card>

      {/*Ratings*/}
      <Card title="Step 2 — Ratings contribution (rating/10 × 0.6)" accent="#f59e0b">
        <p style={{ color: '#6b7280', fontSize: 12, marginBottom: 12 }}>
          For each movie rated ≥ 6, its feature vector is weighted by (rating/10 × 0.6)
          and accumulated into the user profile.
        </p>
        <Formula tex="ratings_contribution[feature] += movie_vector[feature] × (rating / 10) × 0.6" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {data.ratingsContribution.slice(0, 12).map((e: any) => (
            <div key={e.key}>
              <span style={{ color: '#d1d5db', fontSize: 12, fontFamily: 'monospace' }}>
                {e.key}
              </span>
              <Bar value={e.value} max={Math.max(...data.ratingsContribution.map((x: any) => x.value))} color="#f59e0b" />
            </div>
          ))}
        </div>
      </Card>

      {/*User vector*/}
      <Card title="Step 3 — Normalized user profile vector" accent="#6366f1">
        <p style={{ color: '#6b7280', fontSize: 12, marginBottom: 12 }}>
          The combined vector is normalized to unit length (magnitude = 1) so that
          cosine similarity is purely about direction, not magnitude.
        </p>
        <Formula tex={`magnitude = √(Σ vᵢ²)  =  ${data.userVectorMagnitude}\nnormalized[i] = raw[i] / magnitude`} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {data.finalUserVector.map((e: any) => (
            <div key={e.key}>
              <span style={{ color: '#d1d5db', fontSize: 11, fontFamily: 'monospace' }}>{e.key}</span>
              <Bar value={e.value} color="#6366f1" />
            </div>
          ))}
        </div>
      </Card>

      {/*Cosine similarity*/}
      <Card title="Step 4 — Cosine similarity for top candidates" accent="#ec4899">
        <p style={{ color: '#6b7280', fontSize: 12, marginBottom: 12 }}>
          For each candidate movie, cosine similarity is calculated between the user vector
          and the movie's feature vector.
        </p>
        <Formula tex={`similarity(A, B) = (A · B) / (|A| × |B|)\n\nwhere  A · B = Σ (Aᵢ × Bᵢ)  [dot product]\n       |A|  = √(Σ Aᵢ²)      [magnitude of A]\n       |B|  = √(Σ Bᵢ²)      [magnitude of B]`} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
          {data.topCandidates.map((c: any, i: number) => (
            <div
              key={c.movieId}
              style={{
                background: '#0f172a', borderRadius: 10, padding: 16,
                border: expanded === c.movieId ? '1px solid #6366f1' : '1px solid #1f2937',
                cursor: 'pointer',
              }}
              onClick={() => setExpanded(expanded === c.movieId ? null : c.movieId)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: '#1f2937', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 12, color: '#6366f1', fontWeight: 700,
                }}>
                  #{i + 1}
                </div>
                {c.posterPath && (
                  <img
                    src={`${TMDB}${c.posterPath}`}
                    style={{ width: 32, height: 48, borderRadius: 4, objectFit: 'cover' }}
                    alt=""
                  />
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#f9fafb', fontSize: 14, fontWeight: 500 }}>
                    {c.movieTitle}
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                    <Pill label="score" value={c.score} color="#ec4899" />
                    <Pill label="dot" value={c.dotProduct} color="#f59e0b" />
                    <Pill label="|A|" value={c.magnitudeA} color="#10b981" />
                    <Pill label="|B|" value={c.magnitudeB} color="#6366f1" />
                  </div>
                </div>
                <div style={{ fontSize: 20, color: '#4b5563' }}>
                  {expanded === c.movieId ? '▲' : '▼'}
                </div>
              </div>

              {/*Формула з підстановкою*/}
              {expanded === c.movieId && (
                <div style={{ marginTop: 16 }}>
                  <Formula tex={
                    `similarity = dot / (|A| × |B|)\n` +
                    `           = ${c.dotProduct} / (${c.magnitudeA} × ${c.magnitudeB})\n` +
                    `           = ${c.dotProduct} / ${(c.magnitudeA * c.magnitudeB).toFixed(4)}\n` +
                    `           = ${c.score}`
                  } />

                  <div style={{ marginTop: 12 }}>
                    <div style={{ color: '#6b7280', fontSize: 11, marginBottom: 6 }}>
                      TOP CONTRIBUTING FEATURES (user × movie)
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {c.commonKeys.map((k: any) => (
                        <Pill key={k.key} label={k.key} value={k.value} color="#a5b4fc" />
                      ))}
                    </div>
                  </div>

                  <div style={{ marginTop: 12 }}>
                    <div style={{ color: '#6b7280', fontSize: 11, marginBottom: 6 }}>
                      MOVIE FEATURE VECTOR (non-zero)
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {c.movieVector.map((v: any) => (
                        <div key={v.key}>
                          <span style={{ color: '#9ca3af', fontSize: 11, fontFamily: 'monospace' }}>
                            {v.key}
                          </span>
                          <Bar value={v.value} color="#6366f1" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/*Final recommendations*/}
      <Card title="Step 5 — Final recommendations (sorted by score)" accent="#22d3ee">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {data.finalRecommendations.map((r: any, i: number) => (
            <div key={r.movieId} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '8px 12px', background: '#0f172a', borderRadius: 8,
            }}>
              <span style={{ color: '#4b5563', fontFamily: 'monospace', fontSize: 12, minWidth: 24 }}>
                #{i + 1}
              </span>
              {r.posterPath && (
                <img src={`${TMDB}${r.posterPath}`}
                  style={{ width: 24, height: 36, borderRadius: 3, objectFit: 'cover' }} alt="" />
              )}
              <span style={{ flex: 1, color: '#d1d5db', fontSize: 13 }}>{r.movieTitle}</span>
              <div style={{ width: 160 }}>
                <Bar value={r.score} color="#22d3ee" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

//Collaborative Section

function CollaborativeView({ data }: { data: any }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div>

      {/*User similarities*/}
      <Card title="Step 1 — Pearson correlation with other users" accent="#8b5cf6">
        <p style={{ color: '#6b7280', fontSize: 12, marginBottom: 12 }}>
          For each other user who has ≥3 movies in common, Pearson correlation is calculated
          using only the commonly rated movies.
        </p>
        <Formula tex={
          `r(A,B) = Σ[(rᵢₐ - r̄ₐ)(rᵢ_b - r̄_b)]\n` +
          `         ─────────────────────────────────\n` +
          `         √[Σ(rᵢₐ - r̄ₐ)²] × √[Σ(rᵢ_b - r̄_b)²]\n\n` +
          `where  rᵢₐ  = my rating for movie i\n` +
          `       rᵢ_b = other user's rating for movie i\n` +
          `       r̄ₐ   = my mean rating\n` +
          `       r̄_b  = other user's mean rating`
        } />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
          {data.userSimilarities.map((u: any) => (
            <div
              key={u.otherUserId}
              style={{
                background: '#0f172a', borderRadius: 10, padding: 14,
                border: expanded === u.otherUserId ? '1px solid #8b5cf6' : '1px solid #1f2937',
                cursor: 'pointer',
              }}
              onClick={() => setExpanded(expanded === u.otherUserId ? null : u.otherUserId)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: '#1f2937', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 13, color: '#8b5cf6',
                }}>
                  {u.otherUsername[0]?.toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{ color: '#f9fafb', fontSize: 13 }}>{u.otherUsername}</span>
                  <span style={{ color: '#4b5563', fontSize: 11, marginLeft: 8 }}>
                    {u.commonMoviesCount} common movies
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <Pill label="r" value={u.correlation} color="#8b5cf6" />
                  <Pill label="mean_A" value={u.meanA} color="#10b981" />
                  <Pill label="mean_B" value={u.meanB} color="#f59e0b" />
                </div>
                <div style={{ fontSize: 16, color: '#4b5563' }}>
                  {expanded === u.otherUserId ? '▲' : '▼'}
                </div>
              </div>

              {expanded === u.otherUserId && (
                <div style={{ marginTop: 14 }}>
                  <Formula tex={
                    `numerator   = ${u.numerator}\n` +
                    `denominator = ${u.denominatorA} × ${u.denominatorB} = ${(u.denominatorA * u.denominatorB).toFixed(4)}\n` +
                    `r(A,B)      = ${u.numerator} / ${(u.denominatorA * u.denominatorB).toFixed(4)} = ${u.correlation}`
                  } />

                  <div style={{ marginTop: 10 }}>
                    <div style={{ color: '#6b7280', fontSize: 11, marginBottom: 8 }}>
                      COMMON MOVIES BREAKDOWN
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                      <thead>
                        <tr style={{ color: '#4b5563' }}>
                          {['Movie', 'My rating', 'Their rating', 'dev_A', 'dev_B', 'product'].map(h => (
                            <th key={h} style={{ padding: '4px 8px', textAlign: 'left', fontWeight: 400 }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {u.commonMovies.map((m: any, i: number) => (
                          <tr key={i} style={{ borderTop: '1px solid #1f2937' }}>
                            <td style={{ padding: '4px 8px', color: '#9ca3af', fontFamily: 'monospace' }}>
                              {m.movieId.slice(0, 8)}…
                            </td>
                            <td style={{ padding: '4px 8px', color: '#10b981' }}>{m.ratingA}</td>
                            <td style={{ padding: '4px 8px', color: '#f59e0b' }}>{m.ratingB}</td>
                            <td style={{ padding: '4px 8px', color: '#6366f1' }}>{m.deviationA}</td>
                            <td style={{ padding: '4px 8px', color: '#6366f1' }}>{m.deviationB}</td>
                            <td style={{ padding: '4px 8px', color: '#ec4899' }}>{m.product}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/*Predicted scores*/}
      <Card title="Step 2 — Weighted predicted scores for unseen movies" accent="#f97316">
        <p style={{ color: '#6b7280', fontSize: 12, marginBottom: 12 }}>
          For each movie not yet seen, the predicted score is calculated as a
          similarity-weighted average of ratings from similar users.
        </p>
        <Formula tex={
          `predicted(movie) = Σ [sim(A,B) × rating_B(movie)]\n` +
          `                   ────────────────────────────────\n` +
          `                        Σ |sim(A,B)|\n\n` +
          `Only movies rated ≥ 7 by similar users are considered.`
        } />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
          {data.predictedScores.map((p: any, i: number) => (
            <div key={p.movieId} style={{
              background: '#0f172a', borderRadius: 10, padding: 14,
              border: '1px solid #1f2937',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <span style={{ color: '#4b5563', fontFamily: 'monospace', fontSize: 12 }}>#{i + 1}</span>
                <span style={{ flex: 1, color: '#9ca3af', fontFamily: 'monospace', fontSize: 12 }}>
                  {p.movieId.slice(0, 12)}…
                </span>
                <Pill label="predicted" value={p.predictedScore} color="#f97316" />
                <Pill label="Σ(sim×r)" value={p.weightedSum} color="#f59e0b" />
                <Pill label="Σ|sim|" value={p.similaritySum} color="#10b981" />
              </div>

              <Formula tex={
                `predicted = ${p.weightedSum} / ${p.similaritySum} = ${p.predictedScore}`
              } />

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
                {p.contributingUsers.map((u: any) => (
                  <div key={u.userId} style={{
                    background: '#1f2937', borderRadius: 6,
                    padding: '4px 8px', fontSize: 11,
                  }}>
                    <span style={{ color: '#9ca3af' }}>{u.username}</span>
                    <span style={{ color: '#4b5563', margin: '0 4px' }}>·</span>
                    <span style={{ color: '#f59e0b' }}>r={u.rating}</span>
                    <span style={{ color: '#4b5563', margin: '0 4px' }}>·</span>
                    <span style={{ color: '#8b5cf6' }}>sim={u.similarity}</span>
                    <span style={{ color: '#4b5563', margin: '0 4px' }}>=</span>
                    <span style={{ color: '#ec4899' }}>{u.contribution}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Фінальний список */}
      <Card title="Step 3 — Final recommendations (top predicted scores)" accent="#22d3ee">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {data.finalRecommendations.map((r: any, i: number) => (
            <div key={r.movieId} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '8px 12px', background: '#0f172a', borderRadius: 8,
            }}>
              <span style={{ color: '#4b5563', fontFamily: 'monospace', fontSize: 12, minWidth: 24 }}>
                #{i + 1}
              </span>
              <span style={{ flex: 1, color: '#9ca3af', fontFamily: 'monospace', fontSize: 12 }}>
                {r.movieId.slice(0, 16)}…
              </span>
              <div style={{ width: 160 }}>
                <Bar value={r.predictedScore} color="#22d3ee" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

//Main Page

export function ExplainerPage() {
  const [tab, setTab] = useState<'content' | 'collaborative'>('content');

  const contentQuery = useQuery({
    queryKey: ['explain-content'],
    queryFn:  explainerApi.getContentBasedLog,
    enabled:  tab === 'content',
  });

  const collabQuery = useQuery({
    queryKey: ['explain-collab'],
    queryFn:  explainerApi.getCollaborativeLog,
    enabled:  tab === 'collaborative',
  });

  const isLoading = tab === 'content' ? contentQuery.isLoading : collabQuery.isLoading;
  const data      = tab === 'content' ? contentQuery.data : collabQuery.data;

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 16px' }}>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{
          fontSize: 24, fontWeight: 700, color: '#f9fafb',
          fontFamily: 'monospace', letterSpacing: -1,
        }}>
          Algorithm Explainer
        </h1>
        <p style={{ color: '#6b7280', fontSize: 13, marginTop: 6 }}>
          Step-by-step mathematical trace of the recommendation engine
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 4, background: '#111827',
        borderRadius: 10, padding: 4, marginBottom: 28, width: 'fit-content',
      }}>
        {(['content', 'collaborative'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '8px 20px', borderRadius: 8, border: 'none',
              cursor: 'pointer', fontSize: 13, fontFamily: 'monospace',
              background: tab === t ? '#1f2937' : 'transparent',
              color: tab === t
                ? (t === 'content' ? '#6366f1' : '#8b5cf6')
                : '#4b5563',
              transition: 'all .2s',
            }}
          >
            {t === 'content' ? 'Content-Based' : 'Collaborative'}
          </button>
        ))}
      </div>

      {/* Loading */}
      {isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[200, 160, 240, 180].map((h, i) => (
            <div key={i} style={{
              height: h, background: '#111827', borderRadius: 12,
              animation: 'pulse 1.5s ease-in-out infinite',
            }} />
          ))}
        </div>
      )}

      {/* Content */}
      {!isLoading && data && (
        tab === 'content'
          ? <ContentBasedView data={data} />
          : <CollaborativeView data={data} />
      )}

      {/* No data */}
      {!isLoading && !data && (
        <div style={{
          textAlign: 'center', padding: '60px 0', color: '#4b5563',
        }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⚙</div>
          <p>No data yet. Rate some movies and fill out the survey first.</p>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .4; }
        }
      `}</style>
    </div>
  );
}