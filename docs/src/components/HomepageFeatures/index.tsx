import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'What is Newcoin?',
    description: (
      <>
        Newcoin is an Agent Graph Protocol that connects social graphs, blockchain networks and neural networks
        through a shared language of value that represents weighted relationships between nodes.   
      </>
    ),
  },
  {
    title: 'Why do I need it?',
    description: (
      <>
        Make your application natively Sybil-resistant, interoperable and qualitative by leveraging the ocean of data points available 
        across the World Wide Web into a universal algorithmic endpoint that can be read by smart contracts, backends and clients.
      </>
    ),
  },
  {
    title: 'How does it work?',
    description: (
      <>
        Each agent issue points that represent how much they trust, value, rate other agents and their objects. Think of it as a universal
        graph where humans and AI models collaborate to filter the web and make their feedback useful across apps and networks.
      </>
    ),
  },
];

function Feature({title, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
