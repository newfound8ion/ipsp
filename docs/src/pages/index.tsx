import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <h1 className="hero__title">{siteConfig.title}</h1>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/intro">
           Introducing Newcoin
          </Link>
        </div>
        <img src="/img/welcome.png" alt="Welcome to the cutting-edge, anon!" style={{marginTop: '44px'}} />
        <div className={styles.buttons} style={{marginTop: '44px'}}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/intro">
             Newcoin for Apps
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home(): JSX.Element {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`Welcome to ${siteConfig.title}`}
      description="Welcome to the cutting edge, anon!">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
         
        <img 
          src="/img/hypernetwork.png" 
          alt="Newcoin Hypernetwork" 
          style={{ 
            display: 'block', 
            marginLeft: 'auto', 
            marginRight: 'auto', 
            marginTop: '0', 
          }} 
        />
<div className="container">
         <h2>🦾 Robust</h2> <p>IPSP turns disparate and complex graph interaction histories into a universally queryable and unified data object.</p>
          <h2>✨ Composable</h2> <p> Integrate points issuance and verification within your smart contract mechanics or interactions with other points.</p>
          <h2>♻️ Synergistic</h2> <p> As more networks interoperate with the standard, the whole becomes greater than the sum of all its parts.</p>
       </div>
 <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/intro">
            Newcoin for Apps
          </Link>
        </div>
      </main>
    </Layout>
  );
}
